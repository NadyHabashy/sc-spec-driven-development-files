import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Db } from './connection.js'

// Resolved from this module, not the working directory, so both src/ (tsx)
// and dist/ (node) find the project-root migrations/ folder.
export const migrationsDir = fileURLToPath(new URL('../../migrations', import.meta.url))

const migrationFile = /^(\d{3})_[\w-]+\.sql$/

// Applies every migration in migrations/ that hasn't run yet, in filename
// order, each in its own transaction. Returns the versions it applied.
export const migrate = (db: Db, dir = migrationsDir): string[] => {
  db.exec(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL
  )`)

  const applied = new Set(
    db
      .prepare<[], { version: string }>('SELECT version FROM schema_migrations')
      .all()
      .map((row) => row.version),
  )
  const record = db.prepare<[string, string]>(
    'INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)',
  )

  const pending = readdirSync(dir)
    .filter((file) => migrationFile.test(file))
    .sort()
    .filter((file) => !applied.has(file))

  for (const file of pending) {
    const sql = readFileSync(join(dir, file), 'utf8')
    db.transaction(() => {
      db.exec(sql)
      record.run(file, new Date().toISOString())
    })()
  }
  return pending
}

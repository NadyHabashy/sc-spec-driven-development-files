import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import Database from 'better-sqlite3'

export type Db = Database.Database

// Resolved from this module, not the working directory, so the server and the
// db:migrate and db:seed scripts share one file however they're started.
export const defaultDatabasePath = fileURLToPath(
  new URL('../../data/agentclinic.db', import.meta.url),
)

// DATABASE_PATH overrides the default; like any path given on the command
// line, a relative one is relative to the working directory.
export const databasePath = () => process.env.DATABASE_PATH || defaultDatabasePath

// Opens a SQLite database with foreign keys enforced. Pass ':memory:' for an
// in-memory database (tests); file paths get their parent directory created.
export const openDb = (path: string): Db => {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true })
  const db = new Database(path)
  db.pragma('foreign_keys = ON')
  db.pragma('journal_mode = WAL')
  return db
}

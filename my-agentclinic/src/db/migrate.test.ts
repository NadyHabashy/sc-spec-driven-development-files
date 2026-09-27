import { readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { openDb } from './connection.js'
import { migrate, migrationsDir } from './migrate.js'

const migrationFiles = readdirSync(migrationsDir)
  .filter((file) => file.endsWith('.sql'))
  .sort()

const count = (db: ReturnType<typeof openDb>, sql: string) =>
  db.prepare<[], { n: number }>(sql).get()?.n

describe('migrate', () => {
  it('applies every migration in order on a fresh database and records it', () => {
    const db = openDb(':memory:')

    expect(migrate(db)).toEqual(migrationFiles)
    const recorded = db
      .prepare<[], { version: string }>('SELECT version FROM schema_migrations ORDER BY version')
      .all()
      .map((row) => row.version)
    expect(recorded).toEqual(migrationFiles)
  })

  it('creates the catalog tables', () => {
    const db = openDb(':memory:')
    migrate(db)

    const tables = db
      .prepare<[], { name: string }>("SELECT name FROM sqlite_schema WHERE type = 'table'")
      .all()
      .map((row) => row.name)
    expect(tables).toEqual(
      expect.arrayContaining([
        'agents',
        'ailments',
        'therapies',
        'agent_ailments',
        'ailment_therapies',
      ]),
    )
  })

  it('applies nothing when run again', () => {
    const db = openDb(':memory:')
    migrate(db)

    expect(migrate(db)).toEqual([])
    expect(count(db, 'SELECT COUNT(*) AS n FROM schema_migrations')).toBe(migrationFiles.length)
  })

  it('enforces foreign keys', () => {
    const db = openDb(':memory:')
    migrate(db)

    expect(() =>
      db.prepare('INSERT INTO agent_ailments (agent_id, ailment_id) VALUES (999, 999)').run(),
    ).toThrow(/FOREIGN KEY/)
  })

  it('rejects an unknown ailment severity', () => {
    const db = openDb(':memory:')
    migrate(db)

    expect(() =>
      db
        .prepare(
          "INSERT INTO ailments (name, description, severity) VALUES ('Existential Dread', 'Hmm.', 'apocalyptic')",
        )
        .run(),
    ).toThrow(/CHECK/)
  })
})

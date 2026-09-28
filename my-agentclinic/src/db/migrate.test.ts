import { readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { openDb } from './connection.js'
import { migrate, migrationsDir } from './migrate.js'

const migrationFiles = readdirSync(migrationsDir)
  .filter((file) => file.endsWith('.sql'))
  .sort()

const count = (db: ReturnType<typeof openDb>, sql: string) =>
  db.prepare<[], { n: number }>(sql).get()?.n

const book = (db: ReturnType<typeof openDb>, slot: string, status = 'booked') =>
  db
    .prepare(
      "INSERT INTO appointments (agent_id, therapy_id, date, slot, status) VALUES (1, 1, '2026-10-01', ?, ?)",
    )
    .run(slot, status)

const withCatalog = () => {
  const db = openDb(':memory:')
  migrate(db)
  db.exec(`
    INSERT INTO agents (id, name, model, bio) VALUES (1, 'Ada Loop', 'Transformer 7B', 'Tired.');
    INSERT INTO therapies (id, name, description, duration_minutes)
      VALUES (1, 'Context Detox', 'Flush.', 60);
  `)
  return db
}

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

  it('creates the catalog and appointments tables', () => {
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
        'appointments',
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

  it('rejects an unknown appointment status, slot, or malformed date', () => {
    const db = withCatalog()

    expect(() => book(db, '09:00', 'maybe')).toThrow(/CHECK/)
    expect(() => book(db, '08:00')).toThrow(/CHECK/)
    for (const date of ['2026-13-45', '2026-02-30', '1 Oct 2026', '2026-10-1']) {
      expect(() =>
        db
          .prepare(
            "INSERT INTO appointments (agent_id, therapy_id, date, slot) VALUES (1, 1, ?, '09:00')",
          )
          .run(date),
      ).toThrow(/CHECK/)
    }
  })

  it('allows one booked appointment per date and slot, ignoring cancelled ones', () => {
    const db = withCatalog()
    book(db, '09:00', 'cancelled')
    book(db, '09:00')

    expect(() => book(db, '09:00')).toThrow(/UNIQUE/)
    expect(() => book(db, '09:00', 'cancelled')).not.toThrow()
    expect(() => book(db, '10:00')).not.toThrow()
  })
})

import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import Database from 'better-sqlite3'

export type Db = Database.Database

export const defaultDatabasePath = 'data/agentclinic.db'

export const databasePath = () => process.env.DATABASE_PATH ?? defaultDatabasePath

// Opens a SQLite database with foreign keys enforced. Pass ':memory:' for an
// in-memory database (tests); file paths get their parent directory created.
export const openDb = (path: string): Db => {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true })
  const db = new Database(path)
  db.pragma('foreign_keys = ON')
  db.pragma('journal_mode = WAL')
  return db
}

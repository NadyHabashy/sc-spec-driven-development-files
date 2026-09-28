import { createApp } from '../app.js'
import { openDb, type Db } from '../db/connection.js'
import { migrate } from '../db/migrate.js'
import { seed } from '../db/seed.js'

// A fixed local time, so "today" is the same in every test run.
export const fixedNow = () => new Date(2026, 9, 1, 10, 30)

// A fresh in-memory database, migrated and (unless seed is false) seeded.
export const testDb = ({ seeded = true } = {}): Db => {
  const db = openDb(':memory:')
  migrate(db)
  if (seeded) seed(db, fixedNow())
  return db
}

export const testApp = (db: Db = testDb()) => createApp({ db, now: fixedNow })

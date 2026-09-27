import { describe, expect, it } from 'vitest'
import { toIsoDate } from '../appointments/slots.js'
import { fixedNow, testDb } from '../test/db.js'
import type { Db } from './connection.js'
import { seed } from './seed.js'

const count = (db: Db, table: string) =>
  db.prepare<[], { n: number }>(`SELECT COUNT(*) AS n FROM ${table}`).get()?.n

const counts = (db: Db) => ({
  agents: count(db, 'agents'),
  ailments: count(db, 'ailments'),
  therapies: count(db, 'therapies'),
  appointments: count(db, 'appointments'),
})

describe('seed', () => {
  it('inserts 6 agents, 8 ailments, 6 therapies, and 10 appointments', () => {
    expect(counts(testDb())).toEqual({ agents: 6, ailments: 8, therapies: 6, appointments: 10 })
  })

  it('gives the same result when run twice', () => {
    const db = testDb()
    const links = count(db, 'agent_ailments')
    seed(db, fixedNow())

    expect(counts(db)).toEqual({ agents: 6, ailments: 8, therapies: 6, appointments: 10 })
    expect(count(db, 'agent_ailments')).toBe(links)
  })

  it('includes an agent with no ailments', () => {
    const db = testDb()
    const row = db
      .prepare<[], { name: string }>(
        'SELECT name FROM agents WHERE id NOT IN (SELECT agent_id FROM agent_ailments)',
      )
      .all()

    expect(row.map((r) => r.name)).toEqual(['Zen Zero'])
  })

  it('includes an ailment that no therapy treats', () => {
    const db = testDb()
    const row = db
      .prepare<[], { name: string }>(
        'SELECT name FROM ailments WHERE id NOT IN (SELECT ailment_id FROM ailment_therapies)',
      )
      .all()

    expect(row.map((r) => r.name)).toEqual(['Token Budget Insomnia'])
  })

  it('dates appointments relative to now: 3 today, 5 later, 1 past, 1 cancelled', () => {
    const db = testDb()
    const today = toIsoDate(fixedNow())
    const n = (where: string) =>
      db
        .prepare<[string], { n: number }>(`SELECT COUNT(*) AS n FROM appointments WHERE ${where}`)
        .get(today)?.n

    expect(n("status = 'booked' AND date = ?")).toBe(3)
    expect(n("status = 'booked' AND date > ?")).toBe(5)
    expect(n("status = 'booked' AND date < ?")).toBe(1)
    expect(n("status = 'cancelled' AND date >= ?")).toBe(1)
  })

  it('moves appointment dates with now', () => {
    const db = testDb()
    seed(db, new Date(2027, 0, 15, 9))

    const dates = db
      .prepare<[], { date: string }>("SELECT date FROM appointments WHERE status = 'booked'")
      .all()
      .map((row) => row.date)
    expect(dates.filter((date) => date === '2027-01-15')).toHaveLength(3)
    expect(dates).toContain('2027-01-14')
  })

  it('books nothing for the agent with no ailments', () => {
    expect(
      count(
        testDb(),
        "appointments WHERE agent_id = (SELECT id FROM agents WHERE name = 'Zen Zero')",
      ),
    ).toBe(0)
  })
})

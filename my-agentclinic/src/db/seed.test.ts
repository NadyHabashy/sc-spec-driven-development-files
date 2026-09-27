import { describe, expect, it } from 'vitest'
import { testDb } from '../test/db.js'
import type { Db } from './connection.js'
import { seed } from './seed.js'

const count = (db: Db, table: string) =>
  db.prepare<[], { n: number }>(`SELECT COUNT(*) AS n FROM ${table}`).get()?.n

const counts = (db: Db) => ({
  agents: count(db, 'agents'),
  ailments: count(db, 'ailments'),
  therapies: count(db, 'therapies'),
})

describe('seed', () => {
  it('inserts 6 agents, 8 ailments, and 6 therapies', () => {
    expect(counts(testDb())).toEqual({ agents: 6, ailments: 8, therapies: 6 })
  })

  it('gives the same result when run twice', () => {
    const db = testDb()
    const links = count(db, 'agent_ailments')
    seed(db)

    expect(counts(db)).toEqual({ agents: 6, ailments: 8, therapies: 6 })
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
})

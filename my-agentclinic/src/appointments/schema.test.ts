import { describe, expect, it } from 'vitest'
import { fixedNow } from '../test/db.js'
import { bookingSchema, fieldErrors } from './schema.js'

// fixedNow is Thu, Oct 1, 2026 at 10:30.
const valid = {
  agentId: '1',
  therapyId: '2',
  date: '2026-10-02',
  slot: '09:00',
  notes: '  Bringing snacks.  ',
}

const errorsFor = (input: Record<string, unknown>) => {
  const result = bookingSchema(fixedNow()).safeParse(input)
  return result.success ? {} : fieldErrors(result.error)
}

describe('bookingSchema', () => {
  it('accepts a valid booking, converting ids and trimming notes', () => {
    expect(bookingSchema(fixedNow()).parse(valid)).toEqual({
      agentId: 1,
      therapyId: 2,
      date: '2026-10-02',
      slot: '09:00',
      notes: 'Bringing snacks.',
    })
  })

  it('treats missing or blank notes as none', () => {
    expect(bookingSchema(fixedNow()).parse({ ...valid, notes: undefined }).notes).toBeNull()
    expect(bookingSchema(fixedNow()).parse({ ...valid, notes: '   ' }).notes).toBeNull()
  })

  it('accepts a later slot today', () => {
    expect(errorsFor({ ...valid, date: '2026-10-01', slot: '11:00' })).toEqual({})
  })

  it.each([
    ['a non-integer agentId', { agentId: '1.5' }, 'agentId'],
    ['a missing agentId', { agentId: undefined }, 'agentId'],
    ['a non-integer therapyId', { therapyId: 'abc' }, 'therapyId'],
    ['an unknown slot', { slot: '08:00' }, 'slot'],
    ['a malformed date', { date: '10/02/2026' }, 'date'],
    ['an impossible date', { date: '2026-02-30' }, 'date'],
    ['a past date', { date: '2026-09-30' }, 'date'],
    ['a slot earlier today that has started', { date: '2026-10-01', slot: '10:00' }, 'slot'],
    ['notes over 500 characters', { notes: 'z'.repeat(501) }, 'notes'],
  ])('rejects %s', (_, change, field) => {
    const errors = errorsFor({ ...valid, ...change })

    expect(Object.keys(errors)).toEqual([field])
  })

  it('gives friendly messages', () => {
    expect(errorsFor({ ...valid, date: '2026-09-30' }).date).toMatch(/today or a later date/)
    expect(errorsFor({ ...valid, date: '2026-10-01', slot: '09:00' }).slot).toMatch(
      /already started/,
    )
  })
})

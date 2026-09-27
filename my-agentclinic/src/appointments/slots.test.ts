import { describe, expect, it } from 'vitest'
import { testApp } from '../test/db.js'
import { hasStarted, isIsoDate } from './slots.js'

// fixedNow is Thu, Oct 1, 2026 at 10:30.
const options = async (query: string) => {
  const res = await testApp().request(`/appointments/slots?${query}`)
  return { res, body: await res.text() }
}

describe('GET /appointments/slots', () => {
  it('returns all eight slots, disabling taken ones', async () => {
    const { res, body } = await options('date=2026-10-02')

    expect(res.status).toBe(200)
    const slots = [...body.matchAll(/<option value="(\d\d:00)"([^>]*)>([^<]*)<\/option>/g)]
    expect(slots).toHaveLength(8)
    expect(body).toContain('<option value="10:00" disabled="">10:00 (taken)</option>')
    expect(body).toContain('<option value="13:00" disabled="">13:00 (taken)</option>')
    expect(slots.filter((m) => m[2].includes('disabled'))).toHaveLength(2)
    expect(body).toContain('<option value="">Choose a time</option>')
  })

  it("disables today's slots that have started, as well as taken ones", async () => {
    const { body } = await options('date=2026-10-01')

    expect(body).toContain('<option value="09:00" disabled="">09:00 (past)</option>')
    expect(body).toContain('<option value="10:00" disabled="">10:00 (past)</option>')
    expect(body).toContain('<option value="11:00" disabled="">11:00 (taken)</option>')
    expect(body).toContain('<option value="12:00">12:00</option>')
  })

  it('keeps a still-free selected slot selected', async () => {
    expect((await options('date=2026-10-02&slot=09:00')).body).toContain(
      '<option value="09:00" selected="">09:00</option>',
    )
    expect((await options('date=2026-10-02&slot=10:00')).body).not.toContain('selected')
  })

  it('treats cancelled appointments as free', async () => {
    expect((await options('date=2026-10-03')).body).toContain(
      '<option value="11:00">11:00</option>',
    )
  })

  it.each(['', 'date=', 'date=tomorrow', 'date=2026-02-30'])(
    'returns 400 for %j',
    async (query) => {
      expect((await options(query)).res.status).toBe(400)
    },
  )

  it('returns a fragment, not a page', async () => {
    const { body } = await options('date=2026-10-02')
    expect(body).not.toContain('<html')
  })
})

describe('slot helpers', () => {
  it('know when a slot has started', () => {
    const now = new Date(2026, 9, 1, 10, 30)

    expect(hasStarted('2026-09-30', '16:00', now)).toBe(true)
    expect(hasStarted('2026-10-01', '10:00', now)).toBe(true)
    expect(hasStarted('2026-10-01', '11:00', now)).toBe(false)
    expect(hasStarted('2026-10-02', '09:00', now)).toBe(false)
  })

  it('recognize real ISO dates only', () => {
    expect(isIsoDate('2026-10-01')).toBe(true)
    expect(isIsoDate('2028-02-29')).toBe(true)
    for (const value of ['2026-02-30', '2026-13-01', '2026-1-01', '01-10-2026', '']) {
      expect(isIsoDate(value)).toBe(false)
    }
  })
})

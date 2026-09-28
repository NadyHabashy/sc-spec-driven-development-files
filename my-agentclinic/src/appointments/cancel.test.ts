import { describe, expect, it } from 'vitest'
import type { Db } from '../db/connection.js'
import { testApp, testDb } from '../test/db.js'

// fixedNow is Thu, Oct 1, 2026 at 10:30. Seeded appointments used here:
// 4: Oct 2, 10:00, booked (upcoming)   1: Oct 1, 09:00, booked (started)
// 9: Sep 30, 10:00, booked (past)      10: Oct 3, 11:00, cancelled
const setup = () => {
  const db = testDb()
  return { db, app: testApp(db) }
}

const status = (db: Db, id: number) =>
  db.prepare<[number], { status: string }>('SELECT status FROM appointments WHERE id = ?').get(id)
    ?.status

const cancel = (app: ReturnType<typeof testApp>, id: number | string) =>
  app.request(`/appointments/${id}/cancel`, { method: 'POST' })

describe('POST /appointments/:id/cancel', () => {
  it('cancels an upcoming booked appointment and redirects to it', async () => {
    const { db, app } = setup()

    const res = await cancel(app, 4)
    expect(res.status).toBe(303)
    expect(res.headers.get('Location')).toBe('/appointments/4?cancelled=1')
    expect(status(db, 4)).toBe('cancelled')

    const body = await (await app.request('/appointments/4?cancelled=1')).text()
    expect(body).toContain('<strong>Cancelled.</strong>')
    expect(body).toContain('<dd>Cancelled</dd>')
  })

  it('frees the slot for a new booking', async () => {
    const { app } = setup()
    await cancel(app, 4)

    const res = await app.request('/appointments', {
      method: 'POST',
      body: new URLSearchParams({
        agentId: '6',
        therapyId: '1',
        date: '2026-10-02',
        slot: '10:00',
      }),
    })
    expect(res.status).toBe(303)
  })

  it.each([
    [10, 'cancelled', 'This appointment was already cancelled.'],
    [9, 'booked', 'This appointment has already started'],
    [1, 'booked', 'This appointment has already started'],
  ])('returns 409 for appointment %i and leaves it %s', async (id, unchanged, message) => {
    const { db, app } = setup()

    const res = await cancel(app, id)
    expect(res.status).toBe(409)
    expect(status(db, id)).toBe(unchanged)
    expect(await res.text()).toMatch(new RegExp(`role="alert">${message}`))
  })

  it.each(['999', 'abc'])('returns 404 for appointment %s', async (id) => {
    expect((await cancel(setup().app, id)).status).toBe(404)
  })
})

describe('GET /appointments/:id', () => {
  it('shows the details and a Cancel button for an upcoming booking', async () => {
    const body = await (await testApp().request('/appointments/5')).text()

    expect(body).toContain('<h1>Appointment for Rex Regex</h1>')
    expect(body).toContain('<a href="/therapies#therapy-5">Refactoring Retreat</a>')
    expect(body).toContain('<time datetime="2026-10-02">Fri, Oct 2, 2026</time>')
    expect(body).toContain('<dd>Please, no COBOL in the waiting room.</dd>')
    expect(body).toContain('<form method="post" action="/appointments/5/cancel">')
    expect(body).not.toContain('role="status"')
  })

  it.each([
    [10, 'Cancelled'],
    [9, 'Completed'],
    [1, 'Completed'],
  ])('hides the Cancel button for appointment %i (%s)', async (id, label) => {
    const body = await (await testApp().request(`/appointments/${id}`)).text()

    expect(body).toContain(`<dd>${label}</dd>`)
    expect(body).not.toContain('/cancel"')
  })

  it.each(['/appointments/999', '/appointments/abc'])('returns 404 for %s', async (path) => {
    expect((await testApp().request(path)).status).toBe(404)
  })
})

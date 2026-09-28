import { describe, expect, it } from 'vitest'
import type { Db } from '../db/connection.js'
import { testApp, testDb } from '../test/db.js'
import { createAppointment } from './queries.js'

// fixedNow is Thu, Oct 1, 2026 at 10:30. 2026-10-02 09:00 is free in the seed;
// 2026-10-02 10:00 is booked.
const free = {
  agentId: '6',
  therapyId: '4',
  date: '2026-10-02',
  slot: '09:00',
  notes: 'First visit!',
}

const setup = () => {
  const db = testDb()
  return { db, app: testApp(db) }
}

const post = (app: ReturnType<typeof testApp>, fields: Record<string, string>) =>
  app.request('/appointments', { method: 'POST', body: new URLSearchParams(fields) })

const countAppointments = (db: Db) =>
  db.prepare<[], { n: number }>('SELECT COUNT(*) AS n FROM appointments').get()?.n

describe('GET /appointments/new', () => {
  it('renders a form where every control has a label', async () => {
    const res = await testApp().request('/appointments/new')
    expect(res.status).toBe(200)

    const body = await res.text()
    const form = body.slice(body.indexOf('<form'), body.indexOf('</form>'))
    const ids = [...form.matchAll(/<(?:select|input|textarea)[^>]*\bid="([^"]+)"/g)].map(
      (m) => m[1],
    )
    expect(ids).toEqual(['agentId', 'therapyId', 'date', 'slot', 'notes'])
    for (const id of ids) expect(form).toContain(`<label for="${id}">`)
    expect(body).toMatch(/<form method="post" action="\/appointments"/)
    expect(body).toMatch(/<a [^>]*aria-current="page"[^>]*>Appointments<\/a>/)
  })

  it('preselects the agent from ?agentId= and defaults the date to today', async () => {
    const body = await (await testApp().request('/appointments/new?agentId=2')).text()

    expect(body).toMatch(/<option value="2" selected="">Byte Hopper<\/option>/)
    expect(body.match(/selected=""/g)).toHaveLength(1)
    expect(body).toMatch(
      /<input type="date" id="date" name="date" min="2026-10-01" value="2026-10-01"/,
    )
  })

  it('ignores an invalid ?agentId=', async () => {
    const body = await (await testApp().request('/appointments/new?agentId=abc')).text()

    expect(body).not.toContain('selected=""')
  })

  it('loads htmx and wires the date to the slot list', async () => {
    const body = await (await testApp().request('/appointments/new')).text()

    expect(body).toContain('<script src="/htmx.min.js" defer=""></script>')
    expect(body).toMatch(/hx-get="\/appointments\/slots"/)
    expect(body).toMatch(/hx-target="#slot"/)
    expect(body).toMatch(/hx-trigger="load, change"/)
  })

  it('offers all eight slots without JavaScript', async () => {
    const body = await (await testApp().request('/appointments/new')).text()
    const select = body.slice(
      body.indexOf('<select id="slot"'),
      body.indexOf('</select>', body.indexOf('<select id="slot"')),
    )

    expect(select.match(/<option value="\d\d:00">/g)).toHaveLength(8)
    expect(select).not.toContain('disabled')
  })
})

describe('htmx', () => {
  it('is served locally as JavaScript', async () => {
    const res = await testApp().request('/htmx.min.js')

    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toMatch(/javascript/)
  })

  it.each(['/', '/agents', '/appointments', '/appointments/1'])(
    'is not loaded on %s',
    async (path) => {
      expect(await (await testApp().request(path)).text()).not.toContain('htmx')
    },
  )
})

describe('POST /appointments', () => {
  it('books a free slot and redirects to the confirmation', async () => {
    const { db, app } = setup()
    const before = countAppointments(db)

    const res = await post(app, free)
    expect(res.status).toBe(303)
    const location = res.headers.get('Location') ?? ''
    expect(location).toMatch(/^\/appointments\/(\d+)\?booked=1$/)
    expect(countAppointments(db)).toBe((before ?? 0) + 1)

    const id = Number(/\/appointments\/(\d+)/.exec(location)?.[1])
    const row = db.prepare('SELECT * FROM appointments WHERE id = ?').get(id)
    expect(row).toMatchObject({
      agent_id: 6,
      therapy_id: 4,
      date: '2026-10-02',
      slot: '09:00',
      status: 'booked',
      notes: 'First visit!',
    })

    const confirmation = await (await app.request(location)).text()
    expect(confirmation).toMatch(
      /<article class="notice" role="status"><strong>You&#39;re booked!<\/strong>/,
    )
    expect(confirmation).toContain(
      'Zen Zero is down for Mindful Token Breathing on Fri, Oct 2, 2026 at 09:00.',
    )
  })

  it('re-renders with 400, the submitted values, and linked errors when invalid', async () => {
    const { db, app } = setup()
    const before = countAppointments(db)

    const res = await post(app, { ...free, agentId: '', date: '2026-09-01', notes: 'Please hurry' })
    expect(res.status).toBe(400)
    expect(countAppointments(db)).toBe(before)

    const body = await res.text()
    expect(body).toMatch(/<article class="error-summary" role="alert"/)
    expect(body).toContain('<a href="#agentId">Agent: Choose an agent.</a>')
    expect(body).toMatch(/<a href="#date">Date: Pick today or a later date/)
    expect(body).toMatch(
      /<select id="agentId" name="agentId" required="" aria-invalid="true" aria-describedby="agentId-error">/,
    )
    expect(body).toContain('<small id="agentId-error">Choose an agent.</small>')
    expect(body).toMatch(
      /<input type="date"[^>]*value="2026-09-01"[^>]*aria-invalid="true" aria-describedby="date-error"/,
    )
    expect(body).toMatch(/<option value="4" selected="">Mindful Token Breathing<\/option>/)
    expect(body).toContain('Please hurry</textarea>')
    expect(body).not.toMatch(/id="therapyId"[^>]*aria-invalid/)
  })

  it('returns 409 for a taken slot and books nothing', async () => {
    const { db, app } = setup()
    const before = countAppointments(db)

    const res = await post(app, { ...free, slot: '10:00' })
    expect(res.status).toBe(409)
    expect(countAppointments(db)).toBe(before)
    expect(await res.text()).toContain('That time is already taken. Please pick another slot.')
  })

  it('allows a slot whose only appointment was cancelled', async () => {
    // 2026-10-03 11:00 holds only a cancelled appointment in the seed.
    const res = await post(setup().app, { ...free, date: '2026-10-03', slot: '11:00' })

    expect(res.status).toBe(303)
  })

  it.each([
    ['agent', { agentId: '999' }, 'Choose an agent from the list.'],
    ['therapy', { therapyId: '999' }, 'Choose a therapy from the list.'],
  ])('returns 400, not 500, for an unknown %s', async (_, change, message) => {
    const res = await post(setup().app, { ...free, ...change })

    expect(res.status).toBe(400)
    expect(await res.text()).toContain(message)
  })
})

describe('createAppointment', () => {
  it('reports a taken slot from the unique index instead of throwing', () => {
    const db = testDb()
    const booking = { agentId: 6, therapyId: 4, date: '2026-10-02', slot: '10:00', notes: null }

    expect(createAppointment(db, booking)).toBe('taken')
  })

  it('still throws other database errors', () => {
    const db = testDb()
    const booking = { agentId: 999, therapyId: 4, date: '2026-10-02', slot: '09:00', notes: null }

    expect(() => createAppointment(db, booking)).toThrow(/FOREIGN KEY/)
  })
})

describe('notes with line breaks', () => {
  it('accepts 500 typed characters with line breaks and stores them with \\n', async () => {
    const { db, app } = setup()
    const notes = 'z' + ('\n' + 'z'.repeat(98)).repeat(5) + 'z'.repeat(4)

    const res = await post(app, { ...free, notes: notes.replace(/\n/g, '\r\n') })
    expect(res.status).toBe(303)

    const id = Number(/\/appointments\/(\d+)/.exec(res.headers.get('Location') ?? '')?.[1])
    const row = db
      .prepare<[number], { notes: string }>('SELECT notes FROM appointments WHERE id = ?')
      .get(id)
    expect(row?.notes).toBe(notes)
  })
})

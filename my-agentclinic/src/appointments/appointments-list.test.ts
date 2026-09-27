import { describe, expect, it } from 'vitest'
import { testApp, testDb } from '../test/db.js'
import { listPastOrCancelled, listUpcoming } from './queries.js'
import { addDays, formatDate, toIsoDate } from './slots.js'

// fixedNow in src/test/db.ts is Thu, Oct 1, 2026 at 10:30 local time.
const app = testApp()
const page = async () => (await app.request('/appointments')).text()

// The rows of the first table after `marker`, as arrays of cell text.
const rowsAfter = (body: string, marker: string) => {
  const start = body.indexOf(marker)
  const table = body.slice(start, body.indexOf('</table>', start))
  return [...table.matchAll(/<tr>([\s\S]*?)<\/tr>/g)]
    .slice(1)
    .map((row) =>
      [...row[1].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/g)].map((cell) =>
        cell[1].replace(/<[^>]+>/g, '').trim(),
      ),
    )
}

describe('GET /appointments', () => {
  it('lists upcoming booked appointments in date-then-slot order', async () => {
    const res = await app.request('/appointments')
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toMatch(/^text\/html/)

    const rows = rowsAfter(await res.text(), '<caption>Upcoming appointments</caption>')
    expect(rows).toEqual([
      ['Thu, Oct 1, 2026', '09:00', 'Ada Loop', 'Context Detox'],
      ['Thu, Oct 1, 2026', '11:00', 'Byte Hopper', 'Grounding Sessions'],
      ['Thu, Oct 1, 2026', '14:00', 'Captain Prompt', 'Boundary Training'],
      ['Fri, Oct 2, 2026', '10:00', 'Tokenetta', 'Mindful Token Breathing'],
      ['Fri, Oct 2, 2026', '13:00', 'Rex Regex', 'Refactoring Retreat'],
      ['Sat, Oct 3, 2026', '09:00', 'Byte Hopper', 'Creative Brief Counseling'],
      ['Sun, Oct 4, 2026', '15:00', 'Ada Loop', 'Boundary Training'],
      ['Thu, Oct 8, 2026', '16:00', 'Captain Prompt', 'Boundary Training'],
    ])
  })

  it('links each appointment to its agent and therapy', async () => {
    const body = await page()

    expect(body).toContain('<a href="/agents/1">Ada Loop</a>')
    expect(body).toContain('<a href="/therapies#therapy-1">Context Detox</a>')
  })

  it('puts past and cancelled appointments in a <details>, with status as text', async () => {
    const body = await page()
    const details = body.slice(body.indexOf('<details>'), body.indexOf('</details>'))

    expect(details).toContain('<summary>Past and cancelled appointments (2)</summary>')
    expect(rowsAfter(details, '<caption>')).toEqual([
      ['Sat, Oct 3, 2026', '11:00', 'Tokenetta', 'Context Detox', 'Cancelled'],
      ['Wed, Sep 30, 2026', '10:00', 'Rex Regex', 'Grounding Sessions', 'Completed'],
    ])

    const upcoming = rowsAfter(body, '<caption>Upcoming appointments</caption>')
    expect(upcoming.map((row) => row[0])).not.toContain('Wed, Sep 30, 2026')
    expect(upcoming).not.toContainEqual(expect.arrayContaining(['Tokenetta', 'Context Detox']))
  })

  it('renders accessible, scrollable tables', async () => {
    const body = await page()

    expect(body).toMatch(/<div class="overflow-auto"><table><caption>Upcoming appointments/)
    expect(body).toContain('<th scope="col">Date</th>')
    expect(body).toMatch(/<th scope="row"><time datetime="2026-10-01">/)
    expect(body).toMatch(/<a [^>]*aria-current="page"[^>]*>Appointments<\/a>/)
  })

  it('shows an empty state and no details with no appointments', async () => {
    const db = testDb()
    db.exec('DELETE FROM appointments')
    const body = await (await testApp(db).request('/appointments')).text()

    expect(body).toContain('No upcoming appointments.')
    expect(body).not.toContain('<table>')
    expect(body).not.toContain('<details>')
  })
})

describe('appointment queries', () => {
  it('treat appointments later today as upcoming, and yesterday as past', () => {
    const db = testDb()
    const today = toIsoDate(new Date(2026, 9, 1))

    expect(listUpcoming(db, today).every((a) => a.date >= today && a.status === 'booked')).toBe(
      true,
    )
    expect(listPastOrCancelled(db, today).map((a) => a.id)).toEqual([10, 9])
  })
})

describe('date helpers', () => {
  it('format local dates as YYYY-MM-DD and add days across month ends', () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05')
    expect(toIsoDate(addDays(new Date(2026, 9, 31), 1))).toBe('2026-11-01')
    expect(toIsoDate(addDays(new Date(2026, 2, 1), -1))).toBe('2026-02-28')
  })

  it('format a stored date for display without shifting the day', () => {
    expect(formatDate('2026-10-01')).toBe('Thu, Oct 1, 2026')
  })
})

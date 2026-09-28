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
  it('lists booked appointments that have not started, in date-then-slot order', async () => {
    const res = await app.request('/appointments')
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toMatch(/^text\/html/)

    const rows = rowsAfter(await res.text(), '<caption>Upcoming appointments</caption>')
    // Today's 09:00 has started by 10:30, so it's no longer upcoming.
    expect(rows).toEqual([
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

  it('puts started and cancelled appointments in a <details>, with status as text', async () => {
    const body = await page()
    const details = body.slice(body.indexOf('<details>'), body.indexOf('</details>'))

    expect(details).toContain('<summary>Past and cancelled appointments (3)</summary>')
    expect(rowsAfter(details, '<caption>')).toEqual([
      ['Sat, Oct 3, 2026', '11:00', 'Tokenetta', 'Context Detox', 'Cancelled'],
      ['Thu, Oct 1, 2026', '09:00', 'Ada Loop', 'Context Detox', 'Completed'],
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
    expect(body).toMatch(/<th scope="row"><a href="\/appointments\/2"><time datetime="2026-10-01">/)
    expect(body).toMatch(/<a [^>]*aria-current="page"[^>]*>Appointments<\/a>/)
  })

  it('shows an empty state and no details with no appointments', async () => {
    const db = testDb()
    db.exec('DELETE FROM appointments')
    const body = await (await testApp(db).request('/appointments')).text()

    expect(body).toContain('No upcoming appointments.')
    expect(body).toContain('<a href="/appointments/new">Be the first to book</a>')
    expect(body).toContain('<a href="/appointments/new" role="button">Book an appointment</a>')
    expect(body).not.toContain('<table>')
    expect(body).not.toContain('<details>')
  })
})

describe('appointment queries', () => {
  it('split today by whether the slot has started', () => {
    const db = testDb()
    const ids = (now: Date) => ({
      upcoming: listUpcoming(db, now).map((a) => a.id),
      past: listPastOrCancelled(db, now).map((a) => a.id),
    })

    // Oct 1: 1 at 09:00, 2 at 11:00, 3 at 14:00.
    expect(ids(new Date(2026, 9, 1, 8, 59))).toMatchObject({ upcoming: [1, 2, 3, 4, 5, 6, 7, 8] })
    expect(ids(new Date(2026, 9, 1, 9, 0))).toMatchObject({ past: [10, 1, 9] })
    expect(ids(new Date(2026, 9, 1, 11, 30))).toEqual({
      upcoming: [3, 4, 5, 6, 7, 8],
      past: [10, 2, 1, 9],
    })
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

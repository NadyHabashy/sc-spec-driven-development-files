import { describe, expect, it } from 'vitest'
import { seedAgents } from '../db/seed.js'
import { fixedNow, testApp, testDb } from '../test/db.js'
import { counts } from './queries.js'

// fixedNow is Thu, Oct 1, 2026 at 10:30. The seed has 3 booked appointments
// today and 5 later, plus 1 past and 1 cancelled.
const app = testApp()
const page = async (path: string) => (await app.request(path)).text()

const section = (body: string, headingId: string) => {
  const start = body.indexOf(`<h2 id="${headingId}">`)
  return body.slice(start, body.indexOf('</section>', start))
}

describe('GET /dashboard', () => {
  it('shows counts for the seed', async () => {
    const res = await app.request('/dashboard')
    expect(res.status).toBe(200)

    const glance = section(await res.text(), 'glance')
    const stats = [
      ...glance.matchAll(/<p class="stat-value">(\d+)<\/p><p><a [^>]*>([^<]+)<\/a>/g),
    ].map((m) => [m[2], Number(m[1])])
    expect(Object.fromEntries(stats)).toEqual({
      'Appointments today': 3,
      Upcoming: 7,
      Agents: 6,
      Ailments: 8,
      Therapies: 6,
    })
    expect(glance).toContain('<div class="feature-grid">')
  })

  it("lists today's appointments in slot order", async () => {
    const today = section(await page('/dashboard'), 'today')

    expect(today).toContain('<caption>Today&#39;s appointments</caption>')
    const slots = [...today.matchAll(/<time datetime="2026-10-01T(\d\d:\d\d)">/g)].map((m) => m[1])
    expect(slots).toEqual(['09:00', '11:00', '14:00'])
    // Staff still see today's started appointments, with their status.
    expect(today).toContain('<th scope="col">Status</th>')
    expect(today).toMatch(/09:00<\/time><\/td>[\s\S]*?<td>Completed<\/td>/)
    expect(today).not.toContain('2026-10-02')
  })

  it('links every agent to their dashboard', async () => {
    const agents = section(await page('/dashboard'), 'agent-dashboards')

    for (const agent of seedAgents) {
      expect(agents).toContain(`<a href="/agents/${agent.id}/dashboard">${agent.name}</a>`)
    }
  })

  it('marks Dashboard as current', async () => {
    expect(await page('/dashboard')).toMatch(/<a [^>]*aria-current="page"[^>]*>Dashboard<\/a>/)
  })

  it('shows an empty state with no appointments today', async () => {
    const db = testDb()
    db.exec("DELETE FROM appointments WHERE date = '2026-10-01'")
    const body = await (await testApp(db).request('/dashboard')).text()

    expect(section(body, 'today')).toContain('No appointments today.')
    expect(section(body, 'today')).toContain('<a href="/appointments/new">Book an appointment</a>')
    expect(section(body, 'glance')).toContain(
      '<p class="stat-value">0</p><p><a href="#today">Appointments today</a>',
    )
  })
})

describe('counts', () => {
  it('counts all of today, but only unstarted appointments as upcoming', () => {
    expect(counts(testDb(), fixedNow())).toEqual({
      agents: 6,
      ailments: 8,
      therapies: 6,
      today: 3,
      upcoming: 7,
    })
  })
})

describe('GET /agents/:id/dashboard', () => {
  it("shows the agent's ailments, recommended therapies, and own upcoming bookings", async () => {
    // Tokenetta (4): booked Oct 2 10:00; her Oct 3 11:00 booking is cancelled.
    const res = await app.request('/agents/4/dashboard')
    expect(res.status).toBe(200)

    const body = await res.text()
    expect(body).toContain('<h1>Tokenetta&#39;s dashboard</h1>')
    expect(body).toContain('<a href="/ailments#ailment-1">Context-Window Fatigue</a>')
    expect(body).toContain('<a href="/ailments#ailment-8">Token Budget Insomnia</a>')
    expect(body).toContain('<a href="/therapies#therapy-4">Mindful Token Breathing</a>')

    const table = body.slice(body.indexOf('<table>'), body.indexOf('</table>'))
    expect([...table.matchAll(/<time datetime="([^"]+T[^"]+)">/g)].map((m) => m[1])).toEqual([
      '2026-10-02T10:00',
    ])
    expect(table).not.toMatch(/Ada Loop|Byte Hopper|Rex Regex/)
    expect(body).toMatch(/<a [^>]*aria-current="page"[^>]*>Agents<\/a>/)
  })

  it('excludes past appointments', async () => {
    // Rex Regex (5): past on Sep 30, upcoming on Oct 2.
    const body = await page('/agents/5/dashboard')

    expect(body).toContain('2026-10-02T13:00')
    expect(body).not.toContain('2026-09-30')
  })

  it('shows every empty state and a booking link for an agent with nothing', async () => {
    const body = await page('/agents/6/dashboard')

    expect(body).toContain('Nothing diagnosed.')
    expect(body).toContain('No therapies to recommend.')
    expect(body).toContain('Nothing booked.')
    expect(body).toContain('<a href="/appointments/new?agentId=6">Book your first session</a>')
    expect(body).not.toContain('<table>')
    expect(body).toContain(
      '<a href="/appointments/new?agentId=6" role="button">Book an appointment</a>',
    )
  })

  it('is linked from the agent detail page', async () => {
    expect(await page('/agents/2')).toMatch(
      /<a href="\/agents\/2\/dashboard"[^>]*>View dashboard<\/a>/,
    )
  })

  it.each(['/agents/999/dashboard', '/agents/abc/dashboard'])(
    'returns 404 for %s',
    async (path) => {
      expect((await app.request(path)).status).toBe(404)
    },
  )
})

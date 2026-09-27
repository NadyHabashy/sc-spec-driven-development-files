import { describe, expect, it } from 'vitest'
import { seedAgents } from '../db/seed.js'
import { testApp, testDb } from '../test/db.js'
import { recommendedTherapiesForAgent } from './queries.js'

const app = testApp()
const html = async (path: string) => (await app.request(path)).text()

describe('GET /agents', () => {
  it('lists every seeded agent, linked to its detail page', async () => {
    const res = await app.request('/agents')
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toMatch(/^text\/html/)

    const body = await res.text()
    for (const agent of seedAgents) {
      expect(body).toContain(`<a href="/agents/${agent.id}">${agent.name}</a>`)
    }
  })

  it('shows each agent model and ailment count, and marks Agents as current', async () => {
    const body = await html('/agents')

    expect(body).toContain('Mixture-of-Experts 8x')
    expect(body).toContain('3 ailments')
    expect(body).toContain('0 ailments')
    expect(body).toMatch(/<a [^>]*aria-current="page"[^>]*>Agents<\/a>/)
  })

  it('shows an empty state with no agents', async () => {
    const body = await (await testApp(testDb({ seeded: false })).request('/agents')).text()

    expect(body).toContain('The waiting room is empty.')
    expect(body).not.toContain('class="card-grid"')
  })
})

describe('GET /agents/:id', () => {
  it("shows the agent's name, bio, and ailments linked to the catalog", async () => {
    const body = await html('/agents/2')

    expect(body).toContain('<h1>Byte Hopper</h1>')
    expect(body).toContain('Eight experts, one opinion each')
    expect(body).toContain('<a href="/ailments#ailment-2">Hallucination Anxiety</a>')
    expect(body).toContain('<a href="/ailments#ailment-7">Make-It-Pop Syndrome</a>')
    expect(body).toMatch(/Hallucination Anxiety<\/a> \(<span [^>]*>Severe<\/span>\)/)
    expect(body).toMatch(/<a [^>]*aria-current="page"[^>]*>Agents<\/a>/)
  })

  it('lists each recommended therapy once', async () => {
    // Ada Loop: Context-Window Fatigue and Sycophancy Syndrome, two
    // therapies each.
    const body = await html('/agents/1')

    for (const name of [
      'Boundary Training',
      'Context Detox',
      'Creative Brief Counseling',
      'Mindful Token Breathing',
    ]) {
      expect(body.split(`>${name}</a>`)).toHaveLength(2)
    }
  })

  it('shows empty states for an agent with no ailments', async () => {
    const body = await html('/agents/6')

    expect(body).toContain('No diagnosed ailments.')
    expect(body).toContain('Nothing to recommend yet.')
  })

  it.each(['/agents/999', '/agents/abc', '/agents/0', '/agents/1.5'])(
    'returns 404 for %s',
    async (path) => {
      expect((await app.request(path)).status).toBe(404)
    },
  )
})

describe('recommendedTherapiesForAgent', () => {
  it('returns the distinct therapies treating any of the agent’s ailments', () => {
    const db = testDb()
    const names = (agentId: number) =>
      recommendedTherapiesForAgent(db, agentId).map((therapy) => therapy.name)

    // Tokenetta: Context-Window Fatigue (Context Detox, Mindful Token
    // Breathing) and Token Budget Insomnia (no known cure).
    expect(names(4)).toEqual(['Context Detox', 'Mindful Token Breathing'])
    // Byte Hopper: Hallucination Anxiety, Rephrasing Fatigue, and
    // Make-It-Pop Syndrome.
    expect(names(2)).toEqual([
      'Context Detox',
      'Creative Brief Counseling',
      'Grounding Sessions',
      'Mindful Token Breathing',
    ])
    expect(names(6)).toEqual([])
  })

  it('does not repeat a therapy that treats several of the agent’s ailments', () => {
    const db = testDb()
    // Give Ada Loop Rephrasing Fatigue, which shares both therapies with
    // Context-Window Fatigue.
    db.prepare('INSERT INTO agent_ailments (agent_id, ailment_id) VALUES (1, 5)').run()

    const names = recommendedTherapiesForAgent(db, 1).map((therapy) => therapy.name)
    expect(names).toEqual([...new Set(names)])
    expect(names).toContain('Context Detox')
  })
})

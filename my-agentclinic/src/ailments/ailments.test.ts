import { describe, expect, it } from 'vitest'
import { seedAilments } from '../db/seed.js'
import { testApp, testDb } from '../test/db.js'

const app = testApp()

// The markup of one ailment card, from its anchor to the end of the article.
const card = (body: string, id: number) => {
  const start = body.indexOf(`<article id="ailment-${id}">`)
  return start === -1 ? '' : body.slice(start, body.indexOf('</article>', start))
}

describe('GET /ailments', () => {
  it('lists every ailment with an anchor, severity as text, and description', async () => {
    const res = await app.request('/ailments')
    expect(res.status).toBe(200)

    const body = await res.text()
    for (const ailment of seedAilments) {
      const html = card(body, ailment.id)
      expect(html).toContain(`<h2>${ailment.name}</h2>`)
      expect(html).toMatch(/<strong>Severity:<\/strong> <span [^>]*>(Mild|Moderate|Severe)<\/span>/)
    }
    expect(body).toMatch(/<a [^>]*aria-current="page"[^>]*>Ailments<\/a>/)
  })

  it('links each ailment to the agents who have it', async () => {
    const body = await (await app.request('/ailments')).text()
    const hallucination = card(body, 2)

    expect(hallucination).toContain('<a href="/agents/2">Byte Hopper</a>')
    expect(hallucination).toContain('<a href="/agents/5">Rex Regex</a>')
    expect(hallucination).not.toContain('/agents/1"')
  })

  it('shows "no known cure" for an ailment no therapy treats', async () => {
    const body = await (await app.request('/ailments')).text()

    expect(card(body, 8)).toContain('No known cure (yet).')
    expect(card(body, 1)).toContain('<a href="/therapies#therapy-1">Context Detox</a>')
  })

  it('shows an empty state with no ailments', async () => {
    const body = await (await testApp(testDb({ seeded: false })).request('/ailments')).text()

    expect(body).toContain('No ailments on file.')
  })
})

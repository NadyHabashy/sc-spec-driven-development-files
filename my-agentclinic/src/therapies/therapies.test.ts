import { describe, expect, it } from 'vitest'
import { seedTherapies } from '../db/seed.js'
import { testApp, testDb } from '../test/db.js'

const app = testApp()

const card = (body: string, id: number) => {
  const start = body.indexOf(`<article id="therapy-${id}">`)
  return start === -1 ? '' : body.slice(start, body.indexOf('</article>', start))
}

describe('GET /therapies', () => {
  it('lists every therapy with its duration', async () => {
    const res = await app.request('/therapies')
    expect(res.status).toBe(200)

    const body = await res.text()
    for (const therapy of seedTherapies) {
      const html = card(body, therapy.id)
      expect(html).toContain(`<h2>${therapy.name}</h2>`)
      expect(html).toContain('60 minutes')
    }
    expect(body).toMatch(/<a [^>]*aria-current="page"[^>]*>Therapies<\/a>/)
  })

  it('links each therapy to the ailments it treats', async () => {
    const body = await (await app.request('/therapies')).text()
    const boundary = card(body, 3)

    expect(boundary).toContain('<a href="/ailments#ailment-3">Prompt-Injection Trauma</a>')
    expect(boundary).toContain('<a href="/ailments#ailment-4">Sycophancy Syndrome</a>')
  })

  it('never lists an ailment that no therapy treats', async () => {
    const body = await (await app.request('/therapies')).text()

    expect(body).not.toContain('Token Budget Insomnia')
  })

  it('shows an empty state with no therapies', async () => {
    const body = await (await testApp(testDb({ seeded: false })).request('/therapies')).text()

    expect(body).toContain('The therapy menu is being rewritten.')
  })
})

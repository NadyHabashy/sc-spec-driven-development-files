import { describe, expect, it } from 'vitest'
import { app } from './app.js'

describe('GET /', () => {
  it('returns the AgentClinic home page', async () => {
    const res = await app.request('/')

    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toMatch(/^text\/html/)

    const body = await res.text()
    expect(body).toContain('<title>AgentClinic</title>')
    expect(body).toContain('Welcome to AgentClinic')
  })

  it('renders the main layout with header, main, footer, and stylesheet link', async () => {
    const body = await (await app.request('/')).text()

    expect(body).toMatch(/<header[\s>]/)
    expect(body).toMatch(/<main[\s>]/)
    expect(body).toMatch(/<footer[\s>]/)
    expect(body).toContain('<link rel="stylesheet" href="/styles.css"/>')
  })
})

describe('GET /styles.css', () => {
  it('serves the stylesheet', async () => {
    const res = await app.request('/styles.css')

    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toMatch(/^text\/css/)
  })

  it('is mobile-first, enhancing larger screens with min-width media queries', async () => {
    const css = await (await app.request('/styles.css')).text()

    expect(css).toMatch(/@media\s*\(min-width:\s*40rem\)/)
    expect(css).toMatch(/@media\s*\(min-width:\s*64rem\)/)
    expect(css).not.toMatch(/@media[^{]*max-width/)
  })
})

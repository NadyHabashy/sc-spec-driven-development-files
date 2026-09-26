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

  it('renders the main layout with header, main, footer, and stylesheet links', async () => {
    const body = await (await app.request('/')).text()

    expect(body).toMatch(/<header[\s>]/)
    expect(body).toMatch(/<main[\s>]/)
    expect(body).toMatch(/<footer[\s>]/)
    expect(body).toContain('<link rel="stylesheet" href="/pico.min.css"/>')
    expect(body).toContain('<link rel="stylesheet" href="/styles.css"/>')
  })

  it('renders the hero with heading and tagline', async () => {
    const body = await (await app.request('/')).text()

    expect(body).toContain('<h1>Welcome to AgentClinic</h1>')
    expect(body).toContain('Where hard-working AI agents get relief from their humans.')
  })

  it('marks the Home nav link as the current page', async () => {
    const body = await (await app.request('/')).text()

    expect(body).toContain('<a href="/" aria-current="page">Home</a>')
  })

  it('renders three feature cards inside the feature grid', async () => {
    const body = await (await app.request('/')).text()
    const grid = body.match(/<div class="feature-grid">([\s\S]*?)<\/div>/)?.[1] ?? ''

    const headings = [...grid.matchAll(/<article><h2>([^<]+)<\/h2>/g)].map((m) => m[1])
    expect(headings).toEqual(['Ailments', 'Therapies', 'Appointments'])
  })
})

describe('GET /pico.min.css', () => {
  it('serves Pico CSS locally', async () => {
    const res = await app.request('/pico.min.css')

    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toMatch(/^text\/css/)
    expect(await res.text()).toContain('Pico CSS')
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

  it('overrides Pico with brand custom properties and fluid type', async () => {
    const css = await (await app.request('/styles.css')).text()

    expect(css).toMatch(/--pico-[\w-]+\s*:/)
    expect(css).toContain('clamp(')
  })

  it('defines the feature grid', async () => {
    const css = await (await app.request('/styles.css')).text()

    expect(css).toMatch(/\.feature-grid\s*{[^}]*grid-template-columns/)
  })
})

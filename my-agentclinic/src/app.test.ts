import { describe, expect, it } from 'vitest'
import { testApp } from './test/db.js'

const app = testApp()

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

    expect(body).toMatch(/<a [^>]*aria-current="page"[^>]*>Home<\/a>/)
  })

  it('renders three feature cards inside the feature grid', async () => {
    const body = await (await app.request('/')).text()
    const start = body.indexOf('<div class="feature-grid">')
    expect(start).toBeGreaterThan(-1)
    const grid = body.slice(start, body.indexOf('</main>'))

    const headings = [...grid.matchAll(/<article><h2>([\s\S]*?)<\/h2>/g)].map((m) =>
      m[1].replace(/<[^>]+>/g, '').trim(),
    )
    expect(headings).toEqual(['Ailments', 'Therapies', 'Appointments'])
  })

  it('links the Ailments and Therapies cards to their pages', async () => {
    const body = await (await app.request('/')).text()

    expect(body).toMatch(/<h2><a href="\/ailments">Ailments<\/a><\/h2>/)
    expect(body).toMatch(/<h2><a href="\/therapies">Therapies<\/a><\/h2>/)
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

  it('gives nav links a 2.75rem minimum touch target', async () => {
    const css = await (await app.request('/styles.css')).text()

    expect(css).toMatch(/--touch-target:\s*2\.75rem/)
    expect(css).toMatch(
      /nav li :where\(a, \[role="link"\]\)\s*{[^}]*min-height:\s*var\(--touch-target\)/,
    )
  })

  it('makes the container fluid with a rem max-width', async () => {
    const css = await (await app.request('/styles.css')).text()

    expect(css).toMatch(/\.container\s*{[^}]*max-width:\s*[\d.]+rem/)
  })

  it('distinguishes the current nav link beyond color', async () => {
    const css = await (await app.request('/styles.css')).text()

    expect(css).toMatch(/nav li a\[aria-current="page"\]\s*{[^}]*text-decoration:\s*underline/)
  })
})

describe('static assets', () => {
  it('are served regardless of the working directory', async () => {
    const cwd = process.cwd()
    process.chdir(new URL('.', import.meta.url).pathname)
    try {
      expect((await app.request('/pico.min.css')).status).toBe(200)
      expect((await app.request('/styles.css')).status).toBe(200)
    } finally {
      process.chdir(cwd)
    }
  })
})

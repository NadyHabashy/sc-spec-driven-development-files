import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp } from '../app.js'
import { fixedNow, testApp, testDb } from '../test/db.js'

describe('404 page', () => {
  it.each(['/nope', '/agents/999', '/appointments/abc', '/agents/1/nope'])(
    'renders %s inside the layout with a link home',
    async (path) => {
      const res = await testApp().request(path)
      expect(res.status).toBe(404)
      expect(res.headers.get('Content-Type')).toMatch(/^text\/html/)

      const body = await res.text()
      expect(body).toMatch(/^<!doctype html><html lang="en">/)
      expect(body).toContain('<h1>We couldn&#39;t find that page</h1>')
      expect(body).toContain('<a href="/" role="button">Back to the waiting room</a>')
      expect(body).toContain('<nav aria-label="Primary">')
    },
  )
})

describe('500 page', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  const failingApp = () => {
    const app = createApp({ db: testDb(), now: fixedNow })
    app.get('/boom', () => {
      throw new Error('secret database password is hunter2')
    })
    return app
  }

  it('renders a generic page and logs the error', async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {})

    const res = await failingApp().request('/boom')
    expect(res.status).toBe(500)

    const body = await res.text()
    expect(body).toContain('<h1>Something went wrong on our side</h1>')
    expect(body).not.toContain('hunter2')
    expect(body).not.toMatch(/at .*\.(ts|js):\d+/)
    const logged: unknown = log.mock.calls[0]?.[0]
    expect(logged).toBeInstanceOf(Error)
    expect((logged as Error).message).toContain('hunter2')
  })

  it('also covers database failures in real routes', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const db = testDb()
    const app = createApp({ db, now: fixedNow })
    db.close()

    const res = await app.request('/agents')
    expect(res.status).toBe(500)
    expect(await res.text()).not.toContain('database connection is not open')
  })
})

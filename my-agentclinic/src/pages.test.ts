import { describe, expect, it } from 'vitest'
import { testApp } from './test/db.js'

// Every page, including the 404, the booking form's error state, and a
// confirmation.
const pages: [string, () => Response | Promise<Response>][] = [
  '/',
  '/agents',
  '/agents/1',
  '/agents/6',
  '/ailments',
  '/therapies',
  '/appointments',
  '/appointments/new',
  '/appointments/5',
  '/appointments/5?booked=1',
  '/dashboard',
  '/agents/4/dashboard',
  '/agents/6/dashboard',
  '/nope',
].map((path) => [path, () => testApp().request(path)])
pages.push([
  'POST /appointments (errors)',
  () => testApp().request('/appointments', { method: 'POST', body: new URLSearchParams() }),
])

const headingLevels = (html: string) =>
  [...html.matchAll(/<h([1-6])[\s>]/g)].map((m) => Number(m[1]))

describe.each(pages)('%s', (_, request) => {
  it('has exactly one <h1>, and it comes first', async () => {
    const levels = headingLevels(await (await request()).text())

    expect(levels.filter((level) => level === 1)).toHaveLength(1)
    expect(levels[0]).toBe(1)
  })

  it('never skips a heading level on the way down', async () => {
    const levels = headingLevels(await (await request()).text())

    levels.forEach((level, i) => {
      if (i > 0) expect(level - levels[i - 1]).toBeLessThanOrEqual(1)
    })
  })

  it('starts with the skip link', async () => {
    expect(await (await request()).text()).toMatch(
      /<body><a class="skip-link" href="#main">Skip to content<\/a>/,
    )
  })
})

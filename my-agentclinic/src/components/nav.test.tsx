import { describe, expect, it } from 'vitest'
import { renderToString } from '../render.js'
import { isCurrent, Nav, navItems } from './nav.js'

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

describe('Nav', () => {
  const render = (currentPath = '/') => renderToString(<Nav currentPath={currentPath} />)

  it('renders a primary nav landmark', () => {
    expect(render()).toMatch(/^<nav aria-label="Primary">/)
  })

  it('renders the site-name link to /', () => {
    expect(render()).toMatch(/<a class="site-name" href="\/">\s*<strong>AgentClinic<\/strong>/)
  })

  it('lists Home and the catalog pages in this phase', () => {
    expect(navItems.map(({ href }) => href)).toEqual(['/', '/agents', '/ailments', '/therapies'])
    expect(navItems.map(({ label }) => label)).toEqual(['Home', 'Agents', 'Ailments', 'Therapies'])
  })

  it('renders one link per nav item', () => {
    const html = render()
    for (const { href, label } of navItems) {
      expect(html).toMatch(
        new RegExp(`<a [^>]*href="${escapeRegExp(href)}"[^>]*>${escapeRegExp(label)}</a>`),
      )
    }
  })

  it('marks only the link matching currentPath as the current page', () => {
    const current = render('/')
    expect(current).toContain('<a href="/" aria-current="page">Home</a>')
    expect(current.match(/aria-current/g)).toHaveLength(1)

    expect(render('/elsewhere')).not.toContain('aria-current')
  })

  it('marks a section as current on its sub-pages', () => {
    const current = (path: string) =>
      [...render(path).matchAll(/<a [^>]*aria-current="page"[^>]*>([^<]+)<\/a>/g)].map((m) => m[1])

    expect(current('/agents')).toEqual(['Agents'])
    expect(current('/agents/3')).toEqual(['Agents'])
    expect(current('/agents/3/dashboard')).toEqual(['Agents'])
    expect(current('/ailments')).toEqual(['Ailments'])
    expect(current('/agentsmith')).toEqual([])
  })

  it('matches Home only on the home page', () => {
    expect(isCurrent('/', '/')).toBe(true)
    expect(isCurrent('/', '/agents')).toBe(false)
  })
})

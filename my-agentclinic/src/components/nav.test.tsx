import { describe, expect, it } from 'vitest'
import { renderToString } from '../render.js'
import { Nav, navItems } from './nav.js'

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

describe('Nav', () => {
  const render = (currentPath = '/') => renderToString(<Nav currentPath={currentPath} />)

  it('renders a primary nav landmark', () => {
    expect(render()).toMatch(/^<nav aria-label="Primary">/)
  })

  it('renders the site-name link to /', () => {
    expect(render()).toMatch(/<a class="site-name" href="\/">\s*<strong>AgentClinic<\/strong>/)
  })

  it('contains only Home in this phase', () => {
    expect(navItems).toEqual([{ href: '/', label: 'Home' }])
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
})

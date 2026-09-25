import { describe, expect, it } from 'vitest'
import { Footer } from './components/footer.js'
import { Header } from './components/header.js'
import { Main } from './components/main.js'
import { Layout } from './layout.js'

describe('layout subcomponents', () => {
  it('renders Header from src/components/header.tsx', () => {
    expect((<Header />).toString()).toMatch(/^<header[\s>]/)
  })

  it('renders Main from src/components/main.tsx with its children', () => {
    const html = (<Main><p>content</p></Main>).toString()
    expect(html).toMatch(/^<main[\s>]/)
    expect(html).toContain('<p>content</p>')
  })

  it('renders Footer from src/components/footer.tsx', () => {
    expect((<Footer />).toString()).toMatch(/^<footer[\s>]/)
  })
})

describe('Layout', () => {
  const render = (title = 'AgentClinic') =>
    (
      <Layout title={title}>
        <p>page content</p>
      </Layout>
    ).toString()

  it('renders an English HTML document', () => {
    expect(render()).toMatch(/^<html lang="en">/)
  })

  it('includes charset and viewport meta tags', () => {
    const html = render()
    expect(html).toContain('<meta charset="utf-8"/>')
    expect(html).toContain('<meta name="viewport" content="width=device-width, initial-scale=1"/>')
  })

  it('uses the title prop for the document title', () => {
    expect(render('Agents')).toContain('<title>Agents</title>')
  })

  it('escapes special characters in the title', () => {
    expect(render('Tea & <Sympathy>')).toContain('<title>Tea &amp; &lt;Sympathy&gt;</title>')
  })

  it('links the stylesheet in the head', () => {
    const head = render().split('</head>')[0]
    expect(head).toContain('<link rel="stylesheet" href="/styles.css"/>')
  })

  it('renders header, main, and footer in order', () => {
    const html = render()
    const header = html.indexOf('<header')
    const main = html.indexOf('<main')
    const footer = html.indexOf('<footer')
    expect(header).toBeGreaterThan(-1)
    expect(main).toBeGreaterThan(header)
    expect(footer).toBeGreaterThan(main)
  })

  it('renders its children inside main', () => {
    expect(render()).toMatch(/<main[^>]*><p>page content<\/p><\/main>/)
  })
})

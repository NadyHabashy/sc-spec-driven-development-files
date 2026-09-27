import { describe, expect, it } from 'vitest'
import { Footer } from './components/footer.js'
import { Header } from './components/header.js'
import { Main } from './components/main.js'
import { Layout } from './layout.js'
import { renderToString } from './render.js'

describe('layout subcomponents', () => {
  it('renders Header from src/components/header.tsx as a container with the primary nav', () => {
    const html = renderToString(<Header currentPath="/" />)
    expect(html).toMatch(/^<header class="container">/)
    expect(html).toMatch(/<header[^>]*><nav aria-label="Primary">[\s\S]*<\/nav><\/header>$/)
  })

  it('renders Main from src/components/main.tsx as a container with its children', () => {
    const html = renderToString(
      <Main>
        <p>content</p>
      </Main>,
    )
    expect(html).toMatch(/^<main class="container">/)
    expect(html).toContain('<p>content</p>')
  })

  it('renders Footer from src/components/footer.tsx as a container', () => {
    expect(renderToString(<Footer />)).toMatch(/^<footer class="container">/)
  })
})

describe('Layout', () => {
  const render = (title = 'AgentClinic', currentPath = '/') =>
    renderToString(
      <Layout title={title} currentPath={currentPath}>
        <p>page content</p>
      </Layout>,
    )

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

  it('links Pico before our stylesheet in the head', () => {
    const head = render().split('</head>')[0]
    const pico = head.indexOf('<link rel="stylesheet" href="/pico.min.css"/>')
    const styles = head.indexOf('<link rel="stylesheet" href="/styles.css"/>')
    expect(pico).toBeGreaterThan(-1)
    expect(styles).toBeGreaterThan(pico)
  })

  it('requires currentPath and passes it to the nav', () => {
    // Type-only check, never called: tsc fails if currentPath becomes optional.
    const withoutCurrentPath = () =>
      // @ts-expect-error currentPath is required so no page silently marks Home as current
      renderToString(<Layout title="AgentClinic" />)
    expect(withoutCurrentPath).toBeTypeOf('function')

    expect(render('AgentClinic', '/')).toMatch(/<a [^>]*aria-current="page"[^>]*>Home<\/a>/)
    expect(render('AgentClinic', '/elsewhere')).not.toContain('aria-current')
  })

  it('adds deferred page scripts to the head only when given', () => {
    expect(render()).not.toContain('<script')

    const html = renderToString(
      <Layout title="AgentClinic" currentPath="/" scripts={['/htmx.min.js']} />,
    )
    const head = html.split('</head>')[0]
    expect(head).toContain('<script src="/htmx.min.js" defer=""></script>')
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

import type { Child } from 'hono/jsx'
import { Footer } from './components/footer.js'
import { Header } from './components/header.js'
import { Main } from './components/main.js'

export const Layout = ({ title, children }: { title: string; children?: Child }) => (
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{title}</title>
      <link rel="stylesheet" href="/styles.css" />
    </head>
    <body>
      <Header />
      <Main>{children}</Main>
      <Footer />
    </body>
  </html>
)

import type { Child } from 'hono/jsx'

export const Main = ({ children }: { children?: Child }) => (
  <main class="container">{children}</main>
)

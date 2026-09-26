import type { Child } from 'hono/jsx'

export type MainProps = { children?: Child }

export const Main = ({ children }: MainProps) => (
  <main class="container">{children}</main>
)

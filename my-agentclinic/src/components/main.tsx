import type { Child } from 'hono/jsx'

export type MainProps = { children?: Child }

// id="main" is the skip link's target.
export const Main = ({ children }: MainProps) => (
  <main class="container" id="main">
    {children}
  </main>
)

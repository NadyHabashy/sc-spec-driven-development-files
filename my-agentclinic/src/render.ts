import type { JSX } from 'hono/jsx/jsx-runtime'

// Hono types JSX elements as possibly async. Our components are synchronous, so
// render them to a string and fail loudly if an async one sneaks in.
export const renderToString = (element: JSX.Element): string => {
  if (element instanceof Promise) throw new Error('Async components are not supported')
  return element.toString()
}

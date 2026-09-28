import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'
import { agentsRoutes } from './agents/routes.js'
import { ailmentsRoutes } from './ailments/routes.js'
import { appointmentsRoutes } from './appointments/routes.js'
import type { Db } from './db/connection.js'
import { dashboardRoutes } from './dashboard/routes.js'
import type { AppEnv } from './env.js'
import { HomePage } from './home.js'
import { renderPage } from './render.js'
import { therapiesRoutes } from './therapies/routes.js'

// Resolve static assets from this module, not the working directory, so the
// app works however it's started (src/ via tsx or dist/ via node).
const require = createRequire(import.meta.url)
const picoPath = require.resolve('@picocss/pico/css/pico.min.css')
const htmxPath = require.resolve('htmx.org/dist/htmx.min.js')
const publicDir = fileURLToPath(new URL('../public', import.meta.url))

export type AppOptions = {
  db: Db
  // The only source of "today"; tests pass a fixed clock.
  now?: () => Date
}

export const createApp = ({ db, now = () => new Date() }: AppOptions) => {
  const app = new Hono<AppEnv>()

  app.use('/pico.min.css', serveStatic({ path: picoPath }))
  app.use('/styles.css', serveStatic({ root: publicDir }))
  app.use('/htmx.min.js', serveStatic({ path: htmxPath }))

  app.use(async (c, next) => {
    c.set('db', db)
    c.set('now', now)
    await next()
  })

  app.get('/', (c) => c.html(renderPage(<HomePage />)))
  app.route('/agents', agentsRoutes)
  app.route('/ailments', ailmentsRoutes)
  app.route('/therapies', therapiesRoutes)
  app.route('/appointments', appointmentsRoutes)
  app.route('/', dashboardRoutes)

  return app
}

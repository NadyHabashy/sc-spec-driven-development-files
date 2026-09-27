import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { Hono } from 'hono'
import { serveStatic } from '@hono/node-server/serve-static'
import { HomePage } from './home.js'
import { renderToString } from './render.js'

// Resolve static assets from this module, not the working directory, so the
// app works however it's started (src/ via tsx or dist/ via node).
const picoPath = createRequire(import.meta.url).resolve('@picocss/pico/css/pico.min.css')
const publicDir = fileURLToPath(new URL('../public', import.meta.url))

export const app = new Hono()

app.use('/pico.min.css', serveStatic({ path: picoPath }))
app.use('/styles.css', serveStatic({ root: publicDir }))

app.get('/', (c) => c.html('<!doctype html>' + renderToString(<HomePage />)))

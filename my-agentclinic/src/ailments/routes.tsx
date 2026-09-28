import { Hono } from 'hono'
import type { AppEnv } from '../env.js'
import { renderPage } from '../render.js'
import { AilmentsPage } from './pages.js'
import { listAilments } from './queries.js'

export const ailmentsRoutes = new Hono<AppEnv>()

ailmentsRoutes.get('/', (c) =>
  c.html(renderPage(<AilmentsPage ailments={listAilments(c.var.db)} />)),
)

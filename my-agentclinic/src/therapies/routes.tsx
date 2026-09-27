import { Hono } from 'hono'
import type { AppEnv } from '../env.js'
import { renderPage } from '../render.js'
import { TherapiesPage } from './pages.js'
import { listTherapies } from './queries.js'

export const therapiesRoutes = new Hono<AppEnv>()

therapiesRoutes.get('/', (c) =>
  c.html(renderPage(<TherapiesPage therapies={listTherapies(c.var.db)} />)),
)

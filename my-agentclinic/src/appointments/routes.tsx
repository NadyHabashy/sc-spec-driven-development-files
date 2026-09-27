import { Hono } from 'hono'
import type { AppEnv } from '../env.js'
import { renderPage } from '../render.js'
import { AppointmentsPage } from './pages.js'
import { listPastOrCancelled, listUpcoming } from './queries.js'
import { toIsoDate } from './slots.js'

export const appointmentsRoutes = new Hono<AppEnv>()

appointmentsRoutes.get('/', (c) => {
  const today = toIsoDate(c.var.now())

  return c.html(
    renderPage(
      <AppointmentsPage
        today={today}
        upcoming={listUpcoming(c.var.db, today)}
        pastOrCancelled={listPastOrCancelled(c.var.db, today)}
      />,
    ),
  )
})

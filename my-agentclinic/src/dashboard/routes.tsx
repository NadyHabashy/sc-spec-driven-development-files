import { Hono } from 'hono'
import { ailmentsForAgent, getAgent, recommendedTherapiesForAgent } from '../agents/queries.js'
import { agentRefs, listForDay, upcomingForAgent } from '../appointments/queries.js'
import { toIsoDate } from '../appointments/slots.js'
import type { AppEnv } from '../env.js'
import { renderPage } from '../render.js'
import { parseId } from '../validation/params.js'
import { AgentDashboardPage, StaffDashboardPage } from './pages.js'
import { counts } from './queries.js'

// Mounted at the root: the agent dashboard lives under /agents/:id.
export const dashboardRoutes = new Hono<AppEnv>()

dashboardRoutes.get('/dashboard', (c) => {
  const { db } = c.var
  const now = c.var.now()

  return c.html(
    renderPage(
      <StaffDashboardPage
        now={now}
        counts={counts(db, now)}
        today={listForDay(db, toIsoDate(now))}
        agents={agentRefs(db)}
      />,
    ),
  )
})

dashboardRoutes.get('/agents/:id/dashboard', (c) => {
  const { db } = c.var
  const id = parseId(c.req.param('id'))
  const agent = id === null ? undefined : getAgent(db, id)
  if (!agent) return c.notFound()

  return c.html(
    renderPage(
      <AgentDashboardPage
        agent={agent}
        ailments={ailmentsForAgent(db, agent.id)}
        therapies={recommendedTherapiesForAgent(db, agent.id)}
        upcoming={upcomingForAgent(db, agent.id, c.var.now())}
      />,
    ),
  )
})

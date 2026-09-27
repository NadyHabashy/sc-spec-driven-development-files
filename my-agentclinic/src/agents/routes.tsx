import { Hono } from 'hono'
import type { AppEnv } from '../env.js'
import { renderPage } from '../render.js'
import { parseId } from '../validation/params.js'
import { AgentDetailPage, AgentsPage } from './pages.js'
import { ailmentsForAgent, getAgent, listAgents, recommendedTherapiesForAgent } from './queries.js'

export const agentsRoutes = new Hono<AppEnv>()

agentsRoutes.get('/', (c) => c.html(renderPage(<AgentsPage agents={listAgents(c.var.db)} />)))

agentsRoutes.get('/:id', (c) => {
  const id = parseId(c.req.param('id'))
  const agent = id === null ? undefined : getAgent(c.var.db, id)
  if (!agent) return c.notFound()

  return c.html(
    renderPage(
      <AgentDetailPage
        agent={agent}
        ailments={ailmentsForAgent(c.var.db, agent.id)}
        therapies={recommendedTherapiesForAgent(c.var.db, agent.id)}
      />,
    ),
  )
})

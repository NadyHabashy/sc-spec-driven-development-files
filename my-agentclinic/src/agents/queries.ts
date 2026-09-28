import type { Db } from '../db/connection.js'
import type { Agent, Ailment, Therapy } from '../db/types.js'

export type AgentSummary = Agent & { ailment_count: number }

export const listAgents = (db: Db): AgentSummary[] =>
  db
    .prepare<[], AgentSummary>(
      `SELECT agents.*, COUNT(agent_ailments.ailment_id) AS ailment_count
       FROM agents
       LEFT JOIN agent_ailments ON agent_ailments.agent_id = agents.id
       GROUP BY agents.id
       ORDER BY agents.name`,
    )
    .all()

export const getAgent = (db: Db, id: number): Agent | undefined =>
  db.prepare<[number], Agent>('SELECT * FROM agents WHERE id = ?').get(id)

export const ailmentsForAgent = (db: Db, agentId: number): Ailment[] =>
  db
    .prepare<[number], Ailment>(
      `SELECT ailments.*
       FROM ailments
       JOIN agent_ailments ON agent_ailments.ailment_id = ailments.id
       WHERE agent_ailments.agent_id = ?
       ORDER BY ailments.name`,
    )
    .all(agentId)

// The distinct therapies that treat any of the agent's ailments.
export const recommendedTherapiesForAgent = (db: Db, agentId: number): Therapy[] =>
  db
    .prepare<[number], Therapy>(
      `SELECT DISTINCT therapies.*
       FROM therapies
       JOIN ailment_therapies ON ailment_therapies.therapy_id = therapies.id
       JOIN agent_ailments ON agent_ailments.ailment_id = ailment_therapies.ailment_id
       WHERE agent_ailments.agent_id = ?
       ORDER BY therapies.name`,
    )
    .all(agentId)

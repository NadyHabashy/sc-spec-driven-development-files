import type { Db } from '../db/connection.js'
import type { Ailment, Ref } from '../db/types.js'

export type AilmentWithLinks = Ailment & { agents: Ref[]; therapies: Ref[] }

type Link = Ref & { ailment_id: number }

const groupByAilment = (links: Link[]) => {
  const groups = new Map<number, Ref[]>()
  for (const { ailment_id, id, name } of links) {
    groups.set(ailment_id, [...(groups.get(ailment_id) ?? []), { id, name }])
  }
  return groups
}

// Every ailment with the agents who have it and the therapies that treat it.
export const listAilments = (db: Db): AilmentWithLinks[] => {
  const ailments = db.prepare<[], Ailment>('SELECT * FROM ailments ORDER BY name').all()
  const agents = groupByAilment(
    db
      .prepare<[], Link>(
        `SELECT agent_ailments.ailment_id, agents.id, agents.name
         FROM agent_ailments JOIN agents ON agents.id = agent_ailments.agent_id
         ORDER BY agents.name`,
      )
      .all(),
  )
  const therapies = groupByAilment(
    db
      .prepare<[], Link>(
        `SELECT ailment_therapies.ailment_id, therapies.id, therapies.name
         FROM ailment_therapies JOIN therapies ON therapies.id = ailment_therapies.therapy_id
         ORDER BY therapies.name`,
      )
      .all(),
  )

  return ailments.map((ailment) => ({
    ...ailment,
    agents: agents.get(ailment.id) ?? [],
    therapies: therapies.get(ailment.id) ?? [],
  }))
}

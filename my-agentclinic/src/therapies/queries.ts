import type { Db } from '../db/connection.js'
import type { Ref, Therapy } from '../db/types.js'

export type TherapyWithAilments = Therapy & { ailments: Ref[] }

// Every therapy with the ailments it treats.
export const listTherapies = (db: Db): TherapyWithAilments[] => {
  const therapies = db.prepare<[], Therapy>('SELECT * FROM therapies ORDER BY name').all()
  const links = db
    .prepare<[], Ref & { therapy_id: number }>(
      `SELECT ailment_therapies.therapy_id, ailments.id, ailments.name
       FROM ailment_therapies JOIN ailments ON ailments.id = ailment_therapies.ailment_id
       ORDER BY ailments.name`,
    )
    .all()

  return therapies.map((therapy) => ({
    ...therapy,
    ailments: links
      .filter((link) => link.therapy_id === therapy.id)
      .map(({ id, name }) => ({ id, name })),
  }))
}

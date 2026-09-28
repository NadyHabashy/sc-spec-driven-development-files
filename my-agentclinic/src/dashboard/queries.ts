import type { Db } from '../db/connection.js'

export type Counts = {
  agents: number
  ailments: number
  therapies: number
  today: number
  // Booked from today on, matching the Upcoming table on /appointments.
  upcoming: number
}

export const counts = (db: Db, today: string): Counts => {
  const row = db
    .prepare<[string, string], Counts>(
      `SELECT
         (SELECT COUNT(*) FROM agents) AS agents,
         (SELECT COUNT(*) FROM ailments) AS ailments,
         (SELECT COUNT(*) FROM therapies) AS therapies,
         (SELECT COUNT(*) FROM appointments WHERE status = 'booked' AND date = ?) AS today,
         (SELECT COUNT(*) FROM appointments WHERE status = 'booked' AND date >= ?) AS upcoming`,
    )
    .get(today, today)
  if (!row) throw new Error('Count query returned no row')
  return row
}

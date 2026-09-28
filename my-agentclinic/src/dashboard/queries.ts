import { clock, notStartedSql } from '../appointments/slots.js'
import type { Db } from '../db/connection.js'

export type Counts = {
  agents: number
  ailments: number
  therapies: number
  // Every booked appointment today, including ones that have started.
  today: number
  // Booked appointments that haven't started, matching the Upcoming table on
  // /appointments.
  upcoming: number
}

export const counts = (db: Db, now: Date): Counts => {
  const row = db
    .prepare<[ReturnType<typeof clock>], Counts>(
      `SELECT
         (SELECT COUNT(*) FROM agents) AS agents,
         (SELECT COUNT(*) FROM ailments) AS ailments,
         (SELECT COUNT(*) FROM therapies) AS therapies,
         (SELECT COUNT(*) FROM appointments WHERE status = 'booked' AND date = @today) AS today,
         (SELECT COUNT(*) FROM appointments WHERE status = 'booked' AND ${notStartedSql}) AS upcoming`,
    )
    .get(clock(now))
  if (!row) throw new Error('Count query returned no row')
  return row
}

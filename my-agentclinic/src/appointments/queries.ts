import type { Db } from '../db/connection.js'
import type { Appointment } from '../db/types.js'

// An appointment with the names needed to show and link it.
export type AppointmentRow = Appointment & { agent_name: string; therapy_name: string }

const select = `
  SELECT appointments.*, agents.name AS agent_name, therapies.name AS therapy_name
  FROM appointments
  JOIN agents ON agents.id = appointments.agent_id
  JOIN therapies ON therapies.id = appointments.therapy_id`

// Booked appointments from `today` (YYYY-MM-DD) on, soonest first.
export const listUpcoming = (db: Db, today: string): AppointmentRow[] =>
  db
    .prepare<[string], AppointmentRow>(
      `${select}
       WHERE appointments.status = 'booked' AND appointments.date >= ?
       ORDER BY appointments.date, appointments.slot`,
    )
    .all(today)

// Appointments before `today`, and cancelled ones on any date, latest first.
export const listPastOrCancelled = (db: Db, today: string): AppointmentRow[] =>
  db
    .prepare<[string], AppointmentRow>(
      `${select}
       WHERE appointments.status = 'cancelled' OR appointments.date < ?
       ORDER BY appointments.date DESC, appointments.slot DESC`,
    )
    .all(today)

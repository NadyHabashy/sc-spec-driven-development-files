import Database from 'better-sqlite3'
import type { Db } from '../db/connection.js'
import type { Appointment, Ref } from '../db/types.js'
import { clock, notStartedSql } from './slots.js'

// An appointment with the names needed to show and link it.
export type AppointmentRow = Appointment & { agent_name: string; therapy_name: string }

const select = `
  SELECT appointments.*, agents.name AS agent_name, therapies.name AS therapy_name
  FROM appointments
  JOIN agents ON agents.id = appointments.agent_id
  JOIN therapies ON therapies.id = appointments.therapy_id`

type Clock = ReturnType<typeof clock>

// Booked appointments whose slot hasn't started yet, soonest first.
export const listUpcoming = (db: Db, now: Date): AppointmentRow[] =>
  db
    .prepare<[Clock], AppointmentRow>(
      `${select}
       WHERE appointments.status = 'booked' AND ${notStartedSql}
       ORDER BY appointments.date, appointments.slot`,
    )
    .all(clock(now))

// Appointments whose slot has started, and cancelled ones, latest first.
export const listPastOrCancelled = (db: Db, now: Date): AppointmentRow[] =>
  db
    .prepare<[Clock], AppointmentRow>(
      `${select}
       WHERE appointments.status = 'cancelled' OR NOT ${notStartedSql}
       ORDER BY appointments.date DESC, appointments.slot DESC`,
    )
    .all(clock(now))

export const getAppointment = (db: Db, id: number): AppointmentRow | undefined =>
  db.prepare<[number], AppointmentRow>(`${select} WHERE appointments.id = ?`).get(id)

// The slots on `date` (YYYY-MM-DD) that already hold a booked appointment.
export const bookedSlots = (db: Db, date: string): Set<string> =>
  new Set(
    db
      .prepare<[string], { slot: string }>(
        "SELECT slot FROM appointments WHERE date = ? AND status = 'booked'",
      )
      .all(date)
      .map((row) => row.slot),
  )

export const agentRefs = (db: Db): Ref[] =>
  db.prepare<[], Ref>('SELECT id, name FROM agents ORDER BY name').all()

export const therapyRefs = (db: Db): Ref[] =>
  db.prepare<[], Ref>('SELECT id, name FROM therapies ORDER BY name').all()

const exists = (db: Db, table: 'agents' | 'therapies', id: number) =>
  db.prepare<[number], { id: number }>(`SELECT id FROM ${table} WHERE id = ?`).get(id) !== undefined

export const agentExists = (db: Db, id: number) => exists(db, 'agents', id)
export const therapyExists = (db: Db, id: number) => exists(db, 'therapies', id)

export type NewAppointment = {
  agentId: number
  therapyId: number
  date: string
  slot: string
  notes: string | null
}

// Books a slot and returns the new id, or 'taken' if the slot already holds a
// booked appointment. The unique index is the final guard, so a booking that
// races past the route's own check still can't double-book.
export const createAppointment = (db: Db, appointment: NewAppointment): number | 'taken' => {
  try {
    const result = db
      .prepare<[number, number, string, string, string | null]>(
        'INSERT INTO appointments (agent_id, therapy_id, date, slot, notes) VALUES (?, ?, ?, ?, ?)',
      )
      .run(
        appointment.agentId,
        appointment.therapyId,
        appointment.date,
        appointment.slot,
        appointment.notes,
      )
    return Number(result.lastInsertRowid)
  } catch (error) {
    if (error instanceof Database.SqliteError && error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return 'taken'
    }
    throw error
  }
}

// Cancels a booked appointment. Returns false if it wasn't booked.
export const cancelAppointment = (db: Db, id: number): boolean =>
  db
    .prepare<[number]>(
      "UPDATE appointments SET status = 'cancelled' WHERE id = ? AND status = 'booked'",
    )
    .run(id).changes === 1

// Booked appointments on `today` (YYYY-MM-DD), in slot order.
export const listForDay = (db: Db, today: string): AppointmentRow[] =>
  db
    .prepare<[string], AppointmentRow>(
      `${select}
       WHERE appointments.status = 'booked' AND appointments.date = ?
       ORDER BY appointments.slot`,
    )
    .all(today)

// One agent's booked appointments that haven't started, soonest first.
export const upcomingForAgent = (db: Db, agentId: number, now: Date): AppointmentRow[] =>
  db
    .prepare<[Clock & { agentId: number }], AppointmentRow>(
      `${select}
       WHERE appointments.agent_id = @agentId AND appointments.status = 'booked' AND ${notStartedSql}
       ORDER BY appointments.date, appointments.slot`,
    )
    .all({ agentId, ...clock(now) })

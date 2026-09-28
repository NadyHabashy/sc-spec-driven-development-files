import type { Appointment } from '../db/types.js'
import { hasEnded, hasStarted } from './slots.js'

// Status is always shown as text, never by color alone. An appointment is
// upcoming until its slot starts, in progress for its hour, then completed.
export const statusLabel = (
  appointment: Pick<Appointment, 'status' | 'date' | 'slot'>,
  now: Date,
) => {
  if (appointment.status === 'cancelled') return 'Cancelled'
  if (!hasStarted(appointment.date, appointment.slot, now)) return 'Booked'
  return hasEnded(appointment.date, appointment.slot, now) ? 'Completed' : 'In progress'
}

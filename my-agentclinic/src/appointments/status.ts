import type { Appointment } from '../db/types.js'

// Status is always shown as text, never by color alone.
export const statusLabel = (appointment: Pick<Appointment, 'status' | 'date'>, today: string) =>
  appointment.status === 'cancelled'
    ? 'Cancelled'
    : appointment.date < today
      ? 'Completed'
      : 'Booked'

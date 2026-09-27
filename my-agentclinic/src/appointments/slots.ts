// Hourly slots in the clinic's one therapy room. Keep in sync with the slot
// CHECK in migrations/002_appointments.sql.
export const SLOTS = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
] as const

export type Slot = (typeof SLOTS)[number]

const pad = (n: number) => String(n).padStart(2, '0')

// The local calendar date as YYYY-MM-DD, the format stored in the database.
export const toIsoDate = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

// The local date `days` days after (or before, if negative) `date`.
export const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)

// A stored YYYY-MM-DD date for display, e.g. "Thu, Oct 1, 2026". Parsed and
// formatted in UTC so the server's time zone can't shift the day.
export const formatDate = (isoDate: string) =>
  new Date(`${isoDate}T00:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })

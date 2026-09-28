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

// The local time of day as HH:MM, comparable with slot strings.
export const toTime = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`

// A slot has started once its start time has passed; every slot on an earlier
// date has too.
export const hasStarted = (date: string, slot: string, now: Date) => {
  const today = toIsoDate(now)
  return date < today || (date === today && slot <= toTime(now))
}

// A slot has ended an hour after it starts.
export const hasEnded = (date: string, slot: string, now: Date) => {
  const today = toIsoDate(now)
  const end = `${pad(Number(slot.slice(0, 2)) + 1)}:${slot.slice(3)}`
  return date < today || (date === today && end <= toTime(now))
}

// Named SQL parameters for "has this appointment's slot started?", so queries
// use the same rule as hasStarted.
export const clock = (now: Date) => ({ today: toIsoDate(now), time: toTime(now) })
export const notStartedSql =
  '(appointments.date > @today OR (appointments.date = @today AND appointments.slot > @time))'

const isoDate = /^\d{4}-\d{2}-\d{2}$/

// True for a real calendar date written as YYYY-MM-DD (not 2026-02-30).
export const isIsoDate = (value: string) => {
  if (!isoDate.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value)
}

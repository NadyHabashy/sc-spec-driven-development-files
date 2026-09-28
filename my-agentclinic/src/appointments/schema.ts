import { z } from 'zod'
import { positiveId } from '../validation/params.js'
import { hasStarted, isIsoDate, SLOTS, toIsoDate } from './slots.js'

export const bookingFields = ['agentId', 'therapyId', 'date', 'slot', 'notes'] as const
export type BookingField = (typeof bookingFields)[number]

// What the form submitted, kept as strings so an invalid form can be re-filled.
export type BookingValues = Record<BookingField, string>

// Built per request from `now`, so past dates and slots that have already
// started today are judged against the same clock the rest of the app uses.
export const bookingSchema = (now: Date) => {
  const today = toIsoDate(now)

  return (
    z
      .object({
        agentId: positiveId('Choose an agent.'),
        therapyId: positiveId('Choose a therapy.'),
        date: z
          .string({ error: 'Choose a date.' })
          .refine(isIsoDate, 'Enter a real date, like 2026-10-01.')
          .refine((date) => date >= today, 'Pick today or a later date. We can’t treat the past.'),
        slot: z.enum(SLOTS, { error: 'Choose one of the listed times.' }),
        // Forms submit newlines as \r\n, but the textarea's maxlength counts each
        // as one character; normalize first so both agree on the 500 limit, and
        // store plain \n.
        notes: z
          .string()
          .overwrite((notes) => notes.replace(/\r\n?/g, '\n'))
          .trim()
          .max(500, 'Keep notes to 500 characters or fewer.')
          .optional()
          .transform((notes) => notes || null),
      })
      // Only today's slots can have started: earlier dates fail the date rule.
      .refine(({ date, slot }) => date !== today || !hasStarted(date, slot, now), {
        message: 'That time has already started today. Pick a later slot.',
        path: ['slot'],
      })
  )
}

export type BookingInput = z.infer<ReturnType<typeof bookingSchema>>

export type BookingErrors = Partial<Record<BookingField, string>>

// The first message for each invalid field.
export const fieldErrors = (error: z.ZodError): BookingErrors => {
  const errors: BookingErrors = {}
  for (const issue of error.issues) {
    const field = issue.path[0]
    if (bookingFields.includes(field as BookingField) && !errors[field as BookingField]) {
      errors[field as BookingField] = issue.message
    }
  }
  return errors
}

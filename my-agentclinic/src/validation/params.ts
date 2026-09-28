import { z } from 'zod'

// Ids are positive integers written plainly (no signs, decimals, exponents,
// or leading zeros) and small enough for a Number to hold exactly, so a huge
// id can't round to a neighboring row. `message` is shown on forms.
export const positiveId = (message?: string) =>
  z
    .string({ error: message })
    .regex(/^[1-9]\d*$/, message)
    .transform(Number)
    .refine(Number.isSafeInteger, message)

export const idParam = positiveId()

export const parseId = (value: string | undefined): number | null => {
  const result = idParam.safeParse(value)
  return result.success ? result.data : null
}

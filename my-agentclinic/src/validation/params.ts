import { z } from 'zod'

// Route ids are positive integers written plainly (no signs, decimals,
// exponents, or leading zeros) and small enough for a Number to hold exactly,
// so a huge id can't round to a neighboring row.
export const idParam = z
  .string()
  .regex(/^[1-9]\d*$/)
  .transform(Number)
  .refine(Number.isSafeInteger)

export const parseId = (value: string | undefined): number | null => {
  const result = idParam.safeParse(value)
  return result.success ? result.data : null
}

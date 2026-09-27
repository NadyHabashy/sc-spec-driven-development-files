import { z } from 'zod'

// Route ids are positive integers written plainly: no signs, decimals,
// exponents, or leading zeros.
export const idParam = z
  .string()
  .regex(/^[1-9]\d{0,15}$/)
  .transform(Number)

export const parseId = (value: string | undefined): number | null => {
  const result = idParam.safeParse(value)
  return result.success ? result.data : null
}

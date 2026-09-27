import { describe, expect, it } from 'vitest'
import { parseId } from './params.js'

describe('parseId', () => {
  it('accepts positive integers', () => {
    expect(parseId('1')).toBe(1)
    expect(parseId('42')).toBe(42)
  })

  it.each(['', '0', '-1', '1.5', '1e3', '01', ' 1', 'abc', '99999999999999999'])(
    'rejects %j',
    (value) => {
      expect(parseId(value)).toBeNull()
    },
  )

  it('rejects a missing value', () => {
    expect(parseId(undefined)).toBeNull()
  })
})

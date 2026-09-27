import { describe, expect, it } from 'vitest'
import { parseId } from './params.js'

describe('parseId', () => {
  it('accepts positive integers up to the largest safe integer', () => {
    expect(parseId('1')).toBe(1)
    expect(parseId('42')).toBe(42)
    expect(parseId('9007199254740991')).toBe(Number.MAX_SAFE_INTEGER)
  })

  it.each(['9007199254740992', '9007199254740993', '9999999999999999'])(
    'rejects %s, which a Number cannot hold exactly',
    (value) => {
      expect(parseId(value)).toBeNull()
    },
  )

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

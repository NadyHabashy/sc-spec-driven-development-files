import { describe, expect, it } from 'vitest'
import { hasEnded } from './slots.js'
import { statusLabel } from './status.js'

const at = (hour: number, minute = 0) => new Date(2026, 9, 1, hour, minute)
const booked = (slot: string, date = '2026-10-01') => ({ status: 'booked' as const, date, slot })

describe('statusLabel', () => {
  it('is Booked until the slot starts, In progress for its hour, then Completed', () => {
    expect(statusLabel(booked('09:00'), at(8, 59))).toBe('Booked')
    expect(statusLabel(booked('09:00'), at(9))).toBe('In progress')
    expect(statusLabel(booked('09:00'), at(9, 59))).toBe('In progress')
    expect(statusLabel(booked('09:00'), at(10))).toBe('Completed')
    expect(statusLabel(booked('16:00', '2026-09-30'), at(8))).toBe('Completed')
  })

  it('is Cancelled whenever it was cancelled', () => {
    expect(statusLabel({ ...booked('16:00'), status: 'cancelled' }, at(8))).toBe('Cancelled')
  })
})

describe('hasEnded', () => {
  it('ends the last slot at 17:00', () => {
    expect(hasEnded('2026-10-01', '16:00', at(16, 59))).toBe(false)
    expect(hasEnded('2026-10-01', '16:00', at(17))).toBe(true)
  })
})

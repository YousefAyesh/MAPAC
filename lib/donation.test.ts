import { describe, it, expect } from 'vitest'
import { PRESET_AMOUNTS, MIN_CENTS, MAX_CENTS, parseAmountToCents } from './donation'

describe('PRESET_AMOUNTS', () => {
  it('are all within the allowed range', () => {
    for (const dollars of PRESET_AMOUNTS) {
      const cents = dollars * 100
      expect(cents).toBeGreaterThanOrEqual(MIN_CENTS)
      expect(cents).toBeLessThanOrEqual(MAX_CENTS)
    }
  })
})

describe('parseAmountToCents', () => {
  it('converts a whole-dollar number to cents', () => {
    expect(parseAmountToCents(25)).toEqual({ ok: true, cents: 2500 })
  })

  it('converts a dollar string, ignoring a currency symbol and commas', () => {
    expect(parseAmountToCents('$1,500')).toEqual({ ok: true, cents: 150000 })
  })

  it('rounds cents to the nearest whole cent', () => {
    expect(parseAmountToCents('10.005')).toEqual({ ok: true, cents: 1001 })
  })

  it('rejects an amount below the minimum', () => {
    const result = parseAmountToCents(0.5)
    expect(result.ok).toBe(false)
  })

  it('rejects an amount above the maximum', () => {
    const result = parseAmountToCents(1_000_000)
    expect(result.ok).toBe(false)
  })

  it('rejects zero', () => {
    expect(parseAmountToCents(0).ok).toBe(false)
  })

  it('rejects a negative amount, which would otherwise be a refund', () => {
    expect(parseAmountToCents(-50).ok).toBe(false)
  })

  it('rejects NaN and Infinity', () => {
    expect(parseAmountToCents(Number.NaN).ok).toBe(false)
    expect(parseAmountToCents(Number.POSITIVE_INFINITY).ok).toBe(false)
  })

  it('rejects non-numeric text', () => {
    expect(parseAmountToCents('abc').ok).toBe(false)
    expect(parseAmountToCents('').ok).toBe(false)
  })

  it('rejects objects and null, which arrive from untrusted JSON', () => {
    expect(parseAmountToCents({} as unknown as number).ok).toBe(false)
    expect(parseAmountToCents(null as unknown as number).ok).toBe(false)
  })
})

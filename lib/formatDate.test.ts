import { describe, it, expect } from 'vitest'
import { formatDate } from './formatDate'

describe('formatDate', () => {
  it('formats an ISO date as a long US date', () => {
    expect(formatDate('2026-02-14')).toBe('February 14, 2026')
  })

  it('does not shift the day across timezones', () => {
    // Parsing "2026-01-01" as UTC then formatting in a negative-offset zone would
    // yield December 31. It must not.
    expect(formatDate('2026-01-01')).toBe('January 1, 2026')
  })

  it('returns the raw value unchanged when it is not a valid date', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date')
  })
})

import { describe, it, expect } from 'vitest'
import { newsletterSchema, getInvolvedSchema } from './validation'

describe('newsletterSchema', () => {
  it('accepts a valid signup', () => {
    const result = newsletterSchema.safeParse({ name: 'Aisha', email: 'a@example.com', botField: '' })
    expect(result.success).toBe(true)
  })

  it('rejects a malformed email', () => {
    const result = newsletterSchema.safeParse({ name: 'Aisha', email: 'nope', botField: '' })
    expect(result.success).toBe(false)
  })

  it('rejects an empty name', () => {
    const result = newsletterSchema.safeParse({ name: '  ', email: 'a@example.com', botField: '' })
    expect(result.success).toBe(false)
  })

  it('rejects a filled honeypot, which only a bot would fill', () => {
    const result = newsletterSchema.safeParse({
      name: 'Aisha',
      email: 'a@example.com',
      botField: 'http://spam.example',
    })
    expect(result.success).toBe(false)
  })

  it('treats a missing honeypot as empty, since real browsers may omit it', () => {
    const result = newsletterSchema.safeParse({ name: 'Aisha', email: 'a@example.com' })
    expect(result.success).toBe(true)
  })

  it('trims surrounding whitespace from the email', () => {
    const result = newsletterSchema.safeParse({ name: 'Aisha', email: '  a@example.com ' })
    expect(result.success && result.data.email).toBe('a@example.com')
  })

  it('rejects an absurdly long name rather than emailing it onward', () => {
    const result = newsletterSchema.safeParse({ name: 'x'.repeat(300), email: 'a@example.com' })
    expect(result.success).toBe(false)
  })
})

describe('getInvolvedSchema', () => {
  it('accepts a full submission', () => {
    const result = getInvolvedSchema.safeParse({
      name: 'Aisha',
      email: 'a@example.com',
      phone: '(984) 254-7441',
      interest: 'membership',
      message: 'I would like to join.',
    })
    expect(result.success).toBe(true)
  })

  it('accepts a submission with no phone and no message', () => {
    const result = getInvolvedSchema.safeParse({
      name: 'Aisha',
      email: 'a@example.com',
      interest: 'volunteer',
    })
    expect(result.success).toBe(true)
  })

  it('rejects an interest outside the allowed set', () => {
    const result = getInvolvedSchema.safeParse({
      name: 'Aisha',
      email: 'a@example.com',
      interest: 'something-else',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a message long enough to be an abuse vector', () => {
    const result = getInvolvedSchema.safeParse({
      name: 'Aisha',
      email: 'a@example.com',
      interest: 'volunteer',
      message: 'x'.repeat(5001),
    })
    expect(result.success).toBe(false)
  })
})

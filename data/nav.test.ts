import { describe, it, expect } from 'vitest'
import { primaryNav, footerNav } from './nav'

describe('primaryNav', () => {
  it('is the consolidated seven-item nav from the spec', () => {
    expect(primaryNav.map((i) => i.label)).toEqual([
      'About',
      'Elections',
      'Get Involved',
      'News',
      'Donate',
      'Contact',
    ])
  })

  it('contains no link to the retired 2026 primary page', () => {
    const hrefs = [...primaryNav, ...footerNav].map((i) => i.href)
    expect(hrefs.some((h) => h.includes('2026primary'))).toBe(false)
  })

  it('uses root-relative hrefs only', () => {
    expect(primaryNav.every((i) => i.href.startsWith('/'))).toBe(true)
  })
})

import { describe, it, expect } from 'vitest'
import { parseNewsFile } from './news'

describe('parseNewsFile', () => {
  it('parses frontmatter and body', () => {
    const raw = `---
title: MAPAC Statement on Voter Access
date: 2026-10-01
summary: A short summary.
---

The body of the statement.`
    const item = parseNewsFile('voter-access.mdx', raw)
    expect(item.slug).toBe('voter-access')
    expect(item.title).toBe('MAPAC Statement on Voter Access')
    expect(item.date).toBe('2026-10-01')
    expect(item.summary).toBe('A short summary.')
    expect(item.body).toContain('The body of the statement.')
  })

  it('normalises a Date object from YAML into an ISO date string', () => {
    const raw = `---
title: T
date: 2026-01-05
summary: S
---
Body`
    expect(parseNewsFile('t.mdx', raw).date).toBe('2026-01-05')
  })

  it('throws a useful error when title is missing', () => {
    const raw = `---
date: 2026-01-05
summary: S
---
Body`
    expect(() => parseNewsFile('broken.mdx', raw)).toThrow(/broken\.mdx.*title/i)
  })

  it('throws a useful error when date is missing', () => {
    const raw = `---
title: T
summary: S
---
Body`
    expect(() => parseNewsFile('nodate.mdx', raw)).toThrow(/nodate\.mdx.*date/i)
  })
})

import { describe, it, expect } from 'vitest'
import { content, groupByCycle, sortEndorsements } from '@/lib/content'
import type { Endorsement } from '@/lib/content/types'

describe('endorsements', () => {
  it('ships empty, so the Elections page renders no endorsements section', async () => {
    expect(await content.getEndorsements()).toEqual([])
  })
})

describe('sortEndorsements', () => {
  it('orders newest first', () => {
    const items: Endorsement[] = [
      { id: 'a', candidate: 'A', office: 'Mayor', cycle: 'Nov 2026', date: '2026-09-01' },
      { id: 'b', candidate: 'B', office: 'Mayor', cycle: 'Nov 2026', date: '2026-10-01' },
    ]
    expect(sortEndorsements(items).map((e) => e.id)).toEqual(['b', 'a'])
  })

  it('does not mutate its input', () => {
    const items: Endorsement[] = [
      { id: 'a', candidate: 'A', office: 'Mayor', cycle: 'Nov 2026', date: '2026-09-01' },
      { id: 'b', candidate: 'B', office: 'Mayor', cycle: 'Nov 2026', date: '2026-10-01' },
    ]
    sortEndorsements(items)
    expect(items.map((e) => e.id)).toEqual(['a', 'b'])
  })
})

describe('groupByCycle', () => {
  it('returns an empty array for no endorsements', () => {
    expect(groupByCycle([])).toEqual([])
  })

  it('groups by cycle, newest cycle first', () => {
    const items: Endorsement[] = [
      { id: 'a', candidate: 'A', office: 'Mayor', cycle: 'Nov 2026', date: '2026-10-01' },
      { id: 'b', candidate: 'B', office: 'Judge', cycle: 'Mar 2028', date: '2028-01-05' },
      { id: 'c', candidate: 'C', office: 'Council', cycle: 'Nov 2026', date: '2026-09-01' },
    ]
    const groups = groupByCycle(items)
    expect(groups.map((g) => g.cycle)).toEqual(['Mar 2028', 'Nov 2026'])
    expect(groups[1].endorsements.map((e) => e.id)).toEqual(['a', 'c'])
  })
})

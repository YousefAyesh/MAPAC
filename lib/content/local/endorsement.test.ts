import { describe, it, expect } from 'vitest'
import { content } from '@/lib/content'
import { CRITERIA_ORDER } from '@/data/endorsement'

describe('criteria', () => {
  it('returns the eight evaluation criteria in the guide order', async () => {
    const criteria = await content.getCriteria()
    expect(criteria.map((c) => c.title)).toEqual([
      'Engagement with the Muslim Community',
      'Qualifications and Capabilities',
      'Commitment to Civil Liberties',
      'Integrity and Ethics',
      'Policy Positions, Platform, & Vision',
      'Performance Record',
      'Stance on Foreign Policy',
      'Electability and Campaign Standing',
    ])
  })

  it('gives every criterion a most-favorable description', async () => {
    const criteria = await content.getCriteria()
    expect(criteria.every((c) => c.description.length > 40)).toBe(true)
  })
})

describe('rubrics', () => {
  it('returns one rubric per office level', async () => {
    const rubrics = await content.getRubrics()
    expect(rubrics.map((r) => r.office)).toEqual([
      'Local, City, and County Officials',
      'Judiciary',
      'State Legislature',
      'State Executive Officials',
      'Federal Legislature',
    ])
  })

  it('every rubric totals 100 percentage points', async () => {
    const rubrics = await content.getRubrics()
    for (const rubric of rubrics) {
      const total = rubric.rows.reduce((sum, row) => sum + row.weight * 5, 0)
      expect(total, `${rubric.office} must total 100`).toBe(100)
    }
  })

  it('every rubric scores all eight criteria, in the same order', async () => {
    const rubrics = await content.getRubrics()
    for (const rubric of rubrics) {
      expect(rubric.rows.map((r) => r.criterion)).toEqual(CRITERIA_ORDER)
    }
  })

  it('weights Stance on Foreign Policy highest for Federal Legislature', async () => {
    const rubrics = await content.getRubrics()
    const federal = rubrics.find((r) => r.office === 'Federal Legislature')!
    const foreign = federal.rows.find((r) => r.criterion === 'Stance on Foreign Policy')!
    expect(foreign.weight).toBe(4)
  })

  it('weights Commitment to Civil Liberties and Integrity highest for Judiciary', async () => {
    const rubrics = await content.getRubrics()
    const judiciary = rubrics.find((r) => r.office === 'Judiciary')!
    const byName = Object.fromEntries(judiciary.rows.map((r) => [r.criterion, r.weight]))
    expect(byName['Commitment to Civil Liberties']).toBe(4)
    expect(byName['Integrity and Ethics']).toBe(4)
  })
})

describe('principles', () => {
  it('returns the condensed principles the old site published', async () => {
    const principles = await content.getPrinciples()
    expect(principles.length).toBeGreaterThan(0)
  })
})

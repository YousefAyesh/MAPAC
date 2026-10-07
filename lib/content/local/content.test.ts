import { describe, it, expect } from 'vitest'
import { content } from '@/lib/content'

describe('goals', () => {
  it('returns all eight goals from the About page', async () => {
    const goals = await content.getGoals()
    expect(goals).toHaveLength(8)
  })

  it('preserves the engagement goal verbatim', async () => {
    const goals = await content.getGoals()
    expect(goals.map((g) => g.text)).toContain(
      'Engage with politicians at all levels within the US political system.',
    )
  })

  it('includes the two goals the old home page omitted', async () => {
    const texts = (await content.getGoals()).map((g) => g.text)
    expect(texts).toContain(
      'Aim for assurance of basic human rights of all Americans and of all Muslims.',
    )
    expect(texts).toContain(
      'Strive to eliminate in the American society any vestiges of discrimination on the basis of race, gender, religion or ethnicity.',
    )
  })

  it('orders the six home-page goals first so Home can slice them', async () => {
    const goals = await content.getGoals()
    expect(goals[0].id).toBe('participate')
    expect(goals[5].id).toBe('interfaith')
  })

  it('gives every goal a unique id', async () => {
    const goals = await content.getGoals()
    expect(new Set(goals.map((g) => g.id)).size).toBe(goals.length)
  })
})

describe('pillars', () => {
  it('returns the three pillars from the old home page in order', async () => {
    const pillars = await content.getPillars()
    expect(pillars.map((p) => p.title)).toEqual([
      'Elevating Diversity',
      'Advocating for Inclusivity',
      'Fostering Dialogue',
    ])
  })
})

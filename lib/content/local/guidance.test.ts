import { describe, it, expect } from 'vitest'
import { content } from '@/lib/content'

describe('office guidance', () => {
  it('covers the five office groups the guide discusses', async () => {
    const guidance = await content.getOfficeGuidance()
    expect(guidance.map((g) => g.office)).toEqual([
      'Local offices',
      'City councils and county commissioners',
      'Boards of education',
      'Judicial offices',
      'State legislative offices',
    ])
  })

  it('gives every office group substantive prose guidance', async () => {
    const guidance = await content.getOfficeGuidance()
    expect(guidance.every((g) => g.intro.length > 80)).toBe(true)
  })

  it('carries the bulleted criteria for the four groups the guide lists them for', async () => {
    // The guide's "Appropriate criteria for evaluation include:" lists appear under
    // every group EXCEPT Local offices, whose guidance is prose only. An empty array
    // there is correct; inventing bullets to fill it would fabricate MAPAC's positions.
    const guidance = await content.getOfficeGuidance()
    const byId = Object.fromEntries(guidance.map((g) => [g.id, g.criteria.length]))
    expect(byId.local).toBe(0)
    expect(byId.councils).toBeGreaterThan(0)
    expect(byId.education).toBeGreaterThan(0)
    expect(byId.judicial).toBeGreaterThan(0)
    expect(byId['state-legislative']).toBeGreaterThan(0)
  })
})

describe('research categories', () => {
  it('returns the ten categories from the guide', async () => {
    const categories = await content.getResearchCategories()
    expect(categories).toHaveLength(10)
  })

  it('gives every category a unique id', async () => {
    const categories = await content.getResearchCategories()
    expect(new Set(categories.map((c) => c.id)).size).toBe(10)
  })

  it('uses absolute https urls for every link that has one', async () => {
    const categories = await content.getResearchCategories()
    const urls = categories.flatMap((c) => c.links.map((l) => l.url)).filter(Boolean)
    expect(urls.length).toBeGreaterThan(0)
    expect(urls.every((u) => u!.startsWith('https://'))).toBe(true)
  })
})

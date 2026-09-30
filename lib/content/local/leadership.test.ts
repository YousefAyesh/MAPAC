import { describe, it, expect } from 'vitest'
import { content } from '@/lib/content'

describe('trustees', () => {
  it('returns the twelve named board members', async () => {
    expect(await content.getTrustees()).toHaveLength(12)
  })

  it('lists the four board officers first, in constitutional order', async () => {
    const trustees = await content.getTrustees()
    expect(trustees.slice(0, 4).map((p) => p.boardRole)).toEqual([
      'Chair',
      'Vice-Chair',
      'Treasurer',
      'Secretary',
    ])
  })

  it('names Dr. Nabil Abdel-Rahman as Chair', async () => {
    const trustees = await content.getTrustees()
    expect(trustees[0].name).toBe('Dr. Nabil Abdel-Rahman')
  })

  it('gives every trustee a unique id', async () => {
    const trustees = await content.getTrustees()
    expect(new Set(trustees.map((p) => p.id)).size).toBe(12)
  })
})

describe('executive committee', () => {
  it('returns only people holding an executive role', async () => {
    const ec = await content.getExecutiveCommittee()
    expect(ec).toHaveLength(5)
    expect(ec.every((p) => typeof p.executiveRole === 'string')).toBe(true)
  })

  it('names Nigel Edwards as President', async () => {
    const ec = await content.getExecutiveCommittee()
    expect(ec.find((p) => p.executiveRole === 'President')?.name).toBe('Nigel Edwards')
  })

  it('is derived from the trustee roster, so nobody is duplicated or drifts', async () => {
    const [ec, trustees] = await Promise.all([
      content.getExecutiveCommittee(),
      content.getTrustees(),
    ])
    const ids = new Set(trustees.map((p) => p.id))
    expect(ec.every((p) => ids.has(p.id))).toBe(true)
  })
})

describe('outgoing trustees', () => {
  it('acknowledges the twelve former trustees', async () => {
    expect(await content.getOutgoingTrustees()).toHaveLength(12)
  })

  it('includes founder Dr. Khodr Zaarour', async () => {
    const names = (await content.getOutgoingTrustees()).map((p) => p.name)
    expect(names).toContain('Dr. Khodr Zaarour')
  })
})

describe('leadership year', () => {
  it('reports the roster year so the heading can be dated honestly', async () => {
    expect(await content.getLeadershipYear()).toBe(2025)
  })
})

describe('governance bodies', () => {
  it('returns the four bodies in constitutional order', async () => {
    const bodies = await content.getGovernanceBodies()
    expect(bodies.map((b) => b.name)).toEqual([
      'Board of Trustees',
      'Executive Committee',
      'General Body',
      'Appointed Committees',
    ])
  })

  it('carries the bylaws description for each body', async () => {
    const bodies = await content.getGovernanceBodies()
    expect(bodies.every((b) => b.description.length > 80)).toBe(true)
  })
})

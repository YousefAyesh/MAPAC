import { describe, it, expect } from 'vitest'
import { content } from '@/lib/content'

describe('ContentSource completeness', () => {
  it('has no method left throwing "not implemented"', async () => {
    const names = Object.keys(content) as (keyof typeof content)[]
    expect(names.length).toBe(19)

    const stubs: string[] = []
    for (const name of names) {
      try {
        // getNewsBySlug is the only method taking an argument; a miss returns null.
        await (content[name] as (arg?: unknown) => Promise<unknown>)('nonexistent-slug')
      } catch (error) {
        if (error instanceof Error && error.message.includes('not implemented')) {
          stubs.push(name)
        } else {
          throw error
        }
      }
    }

    expect(stubs, `these ContentSource methods are still stubs: ${stubs.join(', ')}`).toEqual([])
  })
})

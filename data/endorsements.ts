import type { Endorsement } from '@/lib/content/types'

/**
 * MAPAC's published endorsements.
 *
 * SHIPS EMPTY ON PURPOSE. An empty array means the Elections page renders no
 * endorsements section — that is what prevents a stale election page. Add entries only
 * when MAPAC has actually published an endorsement. Do not seed example data.
 */
export const endorsements: Endorsement[] = []

/** Newest first. Returns a new array; does not mutate the input. */
export function sortEndorsements(items: Endorsement[]): Endorsement[] {
  return [...items].sort((a, b) => b.date.localeCompare(a.date))
}

export type CycleGroup = {
  cycle: string
  endorsements: Endorsement[]
}

/** Groups endorsements by cycle, newest cycle first, newest within each cycle first. */
export function groupByCycle(items: Endorsement[]): CycleGroup[] {
  const sorted = sortEndorsements(items)
  const groups: CycleGroup[] = []
  for (const item of sorted) {
    const existing = groups.find((g) => g.cycle === item.cycle)
    if (existing) {
      existing.endorsements.push(item)
    } else {
      groups.push({ cycle: item.cycle, endorsements: [item] })
    }
  }
  return groups
}

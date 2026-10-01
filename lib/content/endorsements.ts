import type { Endorsement } from './types'

/**
 * Pure presentation helpers over Endorsement[]. They live beside the content layer, not
 * in `data/`, so they keep working unchanged whichever backend supplies the endorsements.
 */

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

import type { EventItem } from '@/lib/content/types'

/**
 * MAPAC's upcoming events.
 *
 * SHIPS EMPTY ON PURPOSE. MAPAC's own events calendar currently returns zero upcoming
 * events, and the old WordPress site handled that by rendering a widget that announced
 * "There are no upcoming events" -- which is worse than silence. Here, an empty array
 * means the home page shows recent news only and says nothing about events at all.
 *
 * MAPAC does run a recurring programme (the Civic Circles speaker series, General Body
 * meetings, candidate forums), so this will not stay empty for long. Add an entry and it
 * appears in the carousel automatically; entries whose date has passed drop out on their
 * own, so a forgotten event cannot go stale on the page.
 */
export const events: EventItem[] = []

/** Upcoming only, soonest first. Past events fall out automatically. */
export function upcomingEvents(all: EventItem[], now: Date = new Date()): EventItem[] {
  const today = now.toISOString().slice(0, 10)
  return all.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date))
}

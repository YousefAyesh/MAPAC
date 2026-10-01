import { describe, it, expect } from 'vitest'
import { events, upcomingEvents } from './events'
import type { EventItem } from '@/lib/content/types'

const make = (id: string, date: string): EventItem => ({ id, title: id, date })

describe('events', () => {
  it('ships empty, so the home page says nothing about events', () => {
    expect(events).toEqual([])
  })
})

describe('upcomingEvents', () => {
  const now = new Date('2026-10-01T12:00:00Z')

  it('drops events whose date has passed, so nothing goes stale on the page', () => {
    const all = [make('past', '2026-09-30'), make('future', '2026-11-05')]
    expect(upcomingEvents(all, now).map((e) => e.id)).toEqual(['future'])
  })

  it('keeps an event happening today', () => {
    expect(upcomingEvents([make('today', '2026-10-01')], now).map((e) => e.id)).toEqual(['today'])
  })

  it('orders soonest first', () => {
    const all = [make('later', '2026-12-01'), make('sooner', '2026-10-15')]
    expect(upcomingEvents(all, now).map((e) => e.id)).toEqual(['sooner', 'later'])
  })

  it('does not mutate its input', () => {
    const all = [make('b', '2026-12-01'), make('a', '2026-10-15')]
    upcomingEvents(all, now)
    expect(all.map((e) => e.id)).toEqual(['b', 'a'])
  })
})

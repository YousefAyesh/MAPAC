'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import NextImage from 'next/image'
import type { EventItem, NewsItem, Photo } from '@/lib/content/types'
import { formatDate } from '@/lib/formatDate'

export type Slide =
  | { kind: 'event'; item: EventItem }
  | { kind: 'news'; item: NewsItem }

const AUTO_ADVANCE_MS = 7000

/**
 * Upcoming events and recent news, one slide at a time over a photo backdrop.
 *
 * Accessibility notes, because carousels are where this usually goes wrong:
 *  - Auto-advance pauses on hover, on focus within, and whenever the tab is hidden, and
 *    there is an explicit pause/play control. WCAG 2.2.2 requires a way to stop moving
 *    content; a visible control is the honest way to provide it.
 *  - Auto-advance never starts when the visitor prefers reduced motion.
 *  - The live region is polite and only announces the slide text, so a screen-reader user
 *    is not interrupted mid-sentence by a rotation they did not ask for.
 *  - Off-screen slides are `hidden`, keeping their links out of the tab order.
 */
export function LatestCarousel({
  slides,
  backdrop,
}: {
  slides: Slide[]
  backdrop: Photo
}) {
  const [index, setIndex] = useState(0)
  // Two different things stop the rotation, and conflating them is a real bug: if hover
  // flips the toggle's own state, the label changes to "Play" as the pointer approaches,
  // so the button the user aimed at now does the opposite of what it said.
  //   userPaused  - an explicit choice. Only this drives the button label.
  //   suspended   - transient (pointer over, focus within, tab hidden). Invisible to the
  //                 control, and never overrides an explicit decision to play.
  const [userPaused, setUserPaused] = useState(false)
  const [suspended, setSuspended] = useState(false)
  const playing = !userPaused && !suspended
  const regionId = useId()
  const reduceMotion = useRef(false)

  const count = slides.length
  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count])

  // Label what the carousel actually holds. Saying "upcoming events" when it contains
  // none misdescribes the region to anyone navigating by landmark.
  const hasEvents = slides.some((s) => s.kind === 'event')
  const hasNews = slides.some((s) => s.kind === 'news')
  const label =
    hasEvents && hasNews
      ? 'Upcoming events and recent news'
      : hasEvents
        ? 'Upcoming events'
        : 'Recent news'

  useEffect(() => {
    reduceMotion.current =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion.current) setUserPaused(true)
  }, [])

  useEffect(() => {
    if (!playing || count <= 1) return
    const onVisibility = () => setSuspended(document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), AUTO_ADVANCE_MS)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [playing, count])

  if (count === 0) return null

  return (
    <section
      aria-roledescription="carousel"
      aria-label={label}
      className="on-navy relative isolate overflow-hidden bg-navy"
      onMouseEnter={() => setSuspended(true)}
      onMouseLeave={() => setSuspended(false)}
      onFocusCapture={() => setSuspended(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setSuspended(false)
      }}
    >
      <NextImage
        src={backdrop.src}
        alt=""
        fill
        sizes="100vw"
        className="object-cover opacity-25"
        aria-hidden="true"
      />
      {/* Scrim: the backdrop must never win against the text on top of it. */}
      <div aria-hidden="true" className="absolute inset-0 bg-navy/80" />

      <div className="relative mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl">{hasEvents ? 'Latest from MAPAC' : 'Recent news'}</h2>
          {count > 1 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setUserPaused((p) => !p)}
                className="inline-flex min-h-11 items-center rounded border border-white/40 px-3 text-sm font-medium text-white hover:bg-white/10"
              >
                {userPaused ? 'Play' : 'Pause'}
                <span className="sr-only"> automatic rotation</span>
              </button>
              <button
                type="button"
                onClick={() => go(index - 1)}
                aria-controls={regionId}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded border border-white/40 text-white hover:bg-white/10"
              >
                <span aria-hidden="true">&larr;</span>
                <span className="sr-only">Previous</span>
              </button>
              <button
                type="button"
                onClick={() => go(index + 1)}
                aria-controls={regionId}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded border border-white/40 text-white hover:bg-white/10"
              >
                <span aria-hidden="true">&rarr;</span>
                <span className="sr-only">Next</span>
              </button>
            </div>
          )}
        </div>

        <div id={regionId} aria-live="polite" aria-atomic="true" className="mt-6">
          {slides.map((slide, i) => (
            <div
              key={slide.kind === 'event' ? slide.item.id : slide.item.slug}
              hidden={i !== index}
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
            >
              {slide.kind === 'event' ? (
                <EventSlide item={slide.item} />
              ) : (
                <NewsSlide item={slide.item} />
              )}
            </div>
          ))}
        </div>

        {count > 1 && (
          <p className="mt-6 text-sm text-white/70">
            {index + 1} of {count}
          </p>
        )}
      </div>
    </section>
  )
}

function EventSlide({ item }: { item: EventItem }) {
  return (
    <article>
      <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
        Upcoming event
      </p>
      <h3 className="mt-2 max-w-3xl text-xl">{item.title}</h3>
      <p className="mt-2 text-white/80">
        <time dateTime={item.date}>{formatDate(item.date)}</time>
        {item.time ? ` · ${item.time}` : ''}
        {item.location ? ` · ${item.location}` : ''}
      </p>
      {item.description && (
        <p className="mt-3 max-w-2xl leading-relaxed text-white/80">{item.description}</p>
      )}
      {item.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block font-medium text-white underline underline-offset-4"
        >
          Details and registration
        </a>
      )}
    </article>
  )
}

function NewsSlide({ item }: { item: NewsItem }) {
  return (
    <article>
      <p className="text-sm font-semibold uppercase tracking-widest text-white/70">
        Recent news
      </p>
      <h3 className="mt-2 max-w-3xl text-xl">
        <Link href={`/news/${item.slug}`} className="underline-offset-4 hover:underline">
          {item.title}
        </Link>
      </h3>
      <p className="mt-2 text-white/80">
        <time dateTime={item.date}>{formatDate(item.date)}</time>
      </p>
      {item.summary && (
        <p className="mt-3 max-w-2xl leading-relaxed text-white/80">{item.summary}</p>
      )}
    </article>
  )
}

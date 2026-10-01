import { LatestCarousel, type Slide } from '@/components/home/LatestCarousel'
import { photo } from '@/data/photos'
import { content } from '@/lib/content'

const MAX_SLIDES = 5

/**
 * Server wrapper: decides whether there is anything worth showing at all.
 *
 * If MAPAC has no upcoming events and no news, this renders nothing -- no empty carousel,
 * no "no upcoming events" notice. The old WordPress site displayed a widget announcing it
 * had none, which told visitors only that the organisation looked inactive.
 */
export async function LatestSection() {
  const [events, news] = await Promise.all([
    content.getUpcomingEvents(),
    content.getNews(),
  ])

  const slides: Slide[] = [
    ...events.map((item) => ({ kind: 'event' as const, item })),
    ...news.map((item) => ({ kind: 'news' as const, item })),
  ].slice(0, MAX_SLIDES)

  if (slides.length === 0) return null

  return <LatestCarousel slides={slides} backdrop={photo.iftar_hall} />
}

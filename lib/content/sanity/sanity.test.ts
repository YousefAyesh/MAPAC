import { afterEach, describe, expect, it, vi } from 'vitest'
import { localSource } from '../local'
import { fetchEndorsements, fetchGalleryPhotos, withSanity } from '.'

function respondWith(result: unknown, status = 200) {
  const fetchMock = vi.fn(async () => new Response(JSON.stringify({ result }), { status }))
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const endorsementDoc = {
  id: 'abc',
  candidate: 'Jane Doe',
  office: 'NC House, District 34',
  cycle: 'November 2026 General',
  date: '2026-09-30',
  statementUrl: null,
}

const photoDoc = {
  id: 'p1',
  src: 'https://cdn.sanity.io/images/pqx2s4kl/production/abc-1600x1200.jpg',
  alt: 'Attendees seated at round tables.',
  width: 1600,
  height: 1200,
  group: '2026 Annual Dinner',
  credit: null,
}

describe('fetchEndorsements', () => {
  it('maps published documents and drops a null statement link', async () => {
    respondWith([endorsementDoc])
    expect(await fetchEndorsements()).toEqual([
      {
        id: 'abc',
        candidate: 'Jane Doe',
        office: 'NC House, District 34',
        cycle: 'November 2026 General',
        date: '2026-09-30',
        statementUrl: undefined,
      },
    ])
  })

  it('skips a half-filled document instead of failing the page', async () => {
    respondWith([endorsementDoc, { id: 'draft-ish', candidate: 'No Office' }])
    expect((await fetchEndorsements()).map((e) => e.id)).toEqual(['abc'])
  })

  it('caches the query for the revalidation window', async () => {
    const fetchMock = respondWith([])
    await fetchEndorsements()
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit & { next: unknown }]
    expect(url).toContain('https://pqx2s4kl.api.sanity.io/')
    expect(url).toContain('/data/query/production')
    expect(init.next).toEqual({ revalidate: 60 })
  })
})

describe('fetchGalleryPhotos', () => {
  it('maps photo documents with their dimensions', async () => {
    respondWith([photoDoc])
    const [photo] = await fetchGalleryPhotos()
    expect(photo).toMatchObject({ id: 'p1', width: 1600, height: 1200, group: '2026 Annual Dinner' })
    expect(photo.credit).toBeUndefined()
  })

  it('skips a photo with no description', async () => {
    respondWith([{ ...photoDoc, alt: null }])
    expect(await fetchGalleryPhotos()).toEqual([])
  })
})

describe('withSanity', () => {
  const source = withSanity(localSource)

  it('puts Sanity photos ahead of the local library', async () => {
    respondWith([photoDoc])
    const photos = await source.getGalleryPhotos()
    const local = await localSource.getGalleryPhotos()
    expect(photos[0].id).toBe('p1')
    expect(photos).toHaveLength(local.length + 1)
  })

  it('falls back to local content when Sanity is down', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    respondWith(null, 503)
    expect(await source.getEndorsements()).toEqual(await localSource.getEndorsements())
    expect(await source.getGalleryPhotos()).toEqual(await localSource.getGalleryPhotos())
  })

  it('falls back when the network itself fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new TypeError('fetch failed'))))
    expect(await source.getEndorsements()).toEqual([])
  })

  it('leaves every other content method on the local source', async () => {
    expect(await source.getGoals()).toEqual(await localSource.getGoals())
  })
})

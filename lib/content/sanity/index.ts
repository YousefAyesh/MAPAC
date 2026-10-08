import { z } from 'zod'
import { apiVersion, dataset, projectId } from '@/sanity/env'
import type { ContentSource } from '../source'
import type { Endorsement, Photo } from '../types'

/**
 * The Sanity backend covers only what MAPAC edits themselves: endorsements and gallery
 * photos. Everything else stays in `data/`. Sanity results are added in front of the
 * local ones, and any Sanity failure falls back to the local content alone, so an outage
 * or a malformed document never takes a page down.
 */

/** How stale a page may get after an editor publishes. Matches the pages' `revalidate`. */
export const REVALIDATE_SECONDS = 60

/** Set SANITY_DISABLED=1 to read only `data/` (the e2e suite does, so it is deterministic). */
export function sanityEnabled(): boolean {
  return process.env.SANITY_DISABLED !== '1'
}

async function query(groq: string): Promise<unknown[]> {
  const url = `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?query=${encodeURIComponent(groq)}`
  const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } })
  if (!res.ok) throw new Error(`Sanity query failed with HTTP ${res.status}`)
  const body = (await res.json()) as { result?: unknown }
  return Array.isArray(body.result) ? body.result : []
}

/** Parses each document on its own, so one incomplete document is skipped, not fatal. */
function parseEach<T>(schema: z.ZodType<T>, docs: unknown[]): T[] {
  return docs.flatMap((doc) => {
    const parsed = schema.safeParse(doc)
    return parsed.success ? [parsed.data] : []
  })
}

const PUBLISHED = '!(_id in path("drafts.**"))'

const endorsementSchema = z.object({
  id: z.string(),
  candidate: z.string().min(1),
  office: z.string().min(1),
  cycle: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  statementUrl: z
    .string()
    .url()
    .nullish()
    .transform((v) => v ?? undefined),
})

export async function fetchEndorsements(): Promise<Endorsement[]> {
  const docs = await query(
    `*[_type == "endorsement" && ${PUBLISHED}]{ "id": _id, candidate, office, cycle, date, statementUrl }`,
  )
  return parseEach(endorsementSchema, docs)
}

const photoSchema = z.object({
  id: z.string(),
  src: z.string().url(),
  alt: z.string().min(1),
  width: z.number().positive(),
  height: z.number().positive(),
  group: z.string().min(1),
  credit: z
    .string()
    .nullish()
    .transform((v) => v ?? undefined),
})

/** Newest event first, so the most recent group heads the Gallery page. */
export async function fetchGalleryPhotos(): Promise<Photo[]> {
  const docs = await query(
    `*[_type == "galleryPhoto" && ${PUBLISHED}] | order(takenOn desc, _createdAt desc){
      "id": _id,
      "src": image.asset->url,
      "width": image.asset->metadata.dimensions.width,
      "height": image.asset->metadata.dimensions.height,
      alt, group, credit
    }`,
  )
  return parseEach(photoSchema, docs)
}

async function orEmpty<T>(load: () => Promise<T[]>): Promise<T[]> {
  try {
    return await load()
  } catch (error) {
    console.error('Sanity unavailable; showing local content only.', error)
    return []
  }
}

/** `local` with endorsements and gallery photos also drawn from Sanity. */
export function withSanity(local: ContentSource): ContentSource {
  return {
    ...local,
    async getEndorsements() {
      const [remote, own] = await Promise.all([orEmpty(fetchEndorsements), local.getEndorsements()])
      return [...remote, ...own]
    },
    async getGalleryPhotos() {
      const [remote, own] = await Promise.all([orEmpty(fetchGalleryPhotos), local.getGalleryPhotos()])
      return [...remote, ...own]
    },
  }
}

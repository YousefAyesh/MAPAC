import { localSource } from './local'
import type { ContentSource } from './source'

/**
 * The active content backend. To migrate to Sanity, add `lib/content/sanity/`
 * implementing ContentSource and change this one assignment.
 */
export const content: ContentSource = localSource

export * from './types'

import { localSource } from './local'
import { sanityEnabled, withSanity } from './sanity'
import type { ContentSource } from './source'

/**
 * The active content backend: `data/` for everything, plus endorsements and gallery
 * photos that MAPAC publishes in Sanity (edited at /studio).
 */
export const content: ContentSource = sanityEnabled() ? withSanity(localSource) : localSource

export * from './types'
export * from './endorsements'

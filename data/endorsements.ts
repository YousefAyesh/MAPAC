import type { Endorsement } from '@/lib/content/types'

/**
 * MAPAC's published endorsements.
 *
 * SHIPS EMPTY ON PURPOSE. An empty array means the Elections page renders no
 * endorsements section — that is what prevents a stale election page. Add entries only
 * when MAPAC has actually published an endorsement. Do not seed example data.
 */
export const endorsements: Endorsement[] = []

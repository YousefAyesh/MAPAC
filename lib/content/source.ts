import type {
  Criterion,
  Endorsement,
  Goal,
  GovernanceBody,
  NewsItem,
  OfficeGuidance,
  Person,
  Pillar,
  Principle,
  ResearchCategory,
  Rubric,
} from './types'

/**
 * The single contract every content backend implements. The local backend reads
 * `data/` and `content/`. A future Sanity backend implements this same interface,
 * and `lib/content/index.ts` switches which one is exported.
 */
export type ContentSource = {
  getGoals(): Promise<Goal[]>
  getPillars(): Promise<Pillar[]>
  getGovernanceBodies(): Promise<GovernanceBody[]>
  /** Everyone on the Board of Trustees, officers first. */
  getTrustees(): Promise<Person[]>
  /** Only people holding an Executive Committee office. */
  getExecutiveCommittee(): Promise<Person[]>
  /** Former trustees MAPAC acknowledges on the About page. */
  getOutgoingTrustees(): Promise<Person[]>
  /** The year the published roster describes, e.g. 2025. */
  getLeadershipYear(): Promise<number>
  getPrinciples(): Promise<Principle[]>
  getCriteria(): Promise<Criterion[]>
  getRubrics(): Promise<Rubric[]>
  /** Office-level evaluation guidance from the endorsement guide. */
  getOfficeGuidance(): Promise<OfficeGuidance[]>
  /** Voter-research resources from the endorsement guide. */
  getResearchCategories(): Promise<ResearchCategory[]>
  /** Empty array means the Elections page renders no endorsements section. */
  getEndorsements(): Promise<Endorsement[]>
  /** Newest first. Bodies omitted. */
  getNews(): Promise<NewsItem[]>
  /** Null when no post has that slug. */
  getNewsBySlug(slug: string): Promise<NewsItem | null>
}

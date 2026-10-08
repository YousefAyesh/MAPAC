import type {
  Criterion,
  Endorsement,
  EventItem,
  Goal,
  GovernanceBody,
  NewsItem,
  OfficeGuidance,
  Person,
  Photo,
  Pillar,
  Principle,
  ResearchCategory,
  Rubric,
  ScoreLevel,
} from './types'

/**
 * The single contract every content backend implements. The local backend reads
 * `data/` and `content/`; `lib/content/sanity/` layers MAPAC-edited endorsements and
 * gallery photos on top of it.
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
  /** The 1-5 scale each criterion is scored on, lowest first. */
  getScoringScale(): Promise<ScoreLevel[]>
  /** The hard rules that rule a candidate out of endorsement. */
  getDisqualifications(): Promise<string[]>
  /** The sentence stating what MAPAC requires before it endorses. */
  getEndorsementRequirement(): Promise<string>
  /**
   * Where the full endorsement guide PDF lives. A content item, not a constant: the guide
   * is reissued each cycle and its file would move with the CMS's asset storage.
   */
  getEndorsementGuideUrl(): Promise<string>
  /** Office-level evaluation guidance from the endorsement guide. */
  getOfficeGuidance(): Promise<OfficeGuidance[]>
  /** Voter-research resources from the endorsement guide. */
  getResearchCategories(): Promise<ResearchCategory[]>
  /** Upcoming events only, soonest first. Empty means the page mentions no events. */
  getUpcomingEvents(): Promise<EventItem[]>
  /** Empty array means the Elections page renders no endorsements section. */
  getEndorsements(): Promise<Endorsement[]>
  /** Every gallery photograph, in display order. Groups appear in first-seen order. */
  getGalleryPhotos(): Promise<Photo[]>
  /** Newest first. Bodies omitted. */
  getNews(): Promise<NewsItem[]>
  /** Null when no post has that slug. */
  getNewsBySlug(slug: string): Promise<NewsItem | null>
}

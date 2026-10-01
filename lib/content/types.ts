export type Goal = {
  id: string
  text: string
}

export type Pillar = {
  id: string
  title: string
  body: string
}

/** A person in either the Board of Trustees or the Executive Committee. */
export type Person = {
  id: string
  name: string
  /** Board office, e.g. "Chair". Undefined for a trustee with no office. */
  boardRole?: string
  /** Executive Committee office, e.g. "President". Undefined if not on the EC. */
  executiveRole?: string
}

export type GovernanceBody = {
  id: string
  name: string
  description: string
}

export type Principle = {
  id: string
  text: string
}

export type Criterion = {
  id: string
  title: string
  description: string
}

export type RubricRow = {
  criterion: string
  weight: number
}

export type Rubric = {
  id: string
  /** Office level, e.g. "State Legislature". */
  office: string
  rows: RubricRow[]
}

export type Endorsement = {
  id: string
  candidate: string
  office: string
  /** Election cycle label, e.g. "November 2026 General". */
  cycle: string
  /** ISO date the endorsement was issued. */
  date: string
  statementUrl?: string
}

export type ResourceLink = {
  label: string
  /**
   * Absent when the endorsement guide names a resource without linking out
   * (e.g. "Official campaign websites"). Consumers MUST render the label as
   * plain text in that case, never as an <a> with an undefined href.
   */
  url?: string
}

/** One category from the guide's "Tools for Researching Candidates". */
export type ResearchCategory = {
  id: string
  title: string
  description: string
  links: ResourceLink[]
}

/** Office-level evaluation guidance from the guide. */
export type OfficeGuidance = {
  id: string
  office: string
  intro: string
  criteria: string[]
}

export type NewsItem = {
  slug: string
  title: string
  /** ISO date. */
  date: string
  summary: string
  /**
   * Content serialized ready for this site's MDX renderer — i.e. a string that can be
   * passed straight to `<MDXRemote source={...} />`. Absent on index listings, which
   * strip it.
   *
   * This is a contract, not an implementation detail: a CMS-backed source stores rich
   * text as structured blocks (Sanity uses portable text), so its adapter is responsible
   * for serializing to this same shape rather than returning raw blocks. Otherwise the
   * rendering component would need a second, different renderer.
   */
  body?: string
}

/** One step on the guide's 1-5 scoring scale. */
export type ScoreLevel = {
  score: number
  label: string
}

export type Photo = {
  id: string
  src: string
  /** Describes only what is visibly in the frame. Never asserts a name. */
  alt: string
  width: number
  height: number
  /** Grouping label used by the gallery. */
  group: string
}

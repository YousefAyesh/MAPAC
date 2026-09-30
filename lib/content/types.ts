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
  /** Rendered MDX body. Absent on index listings. */
  body?: string
}

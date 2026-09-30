import type { Criterion, Principle, Rubric } from '@/lib/content/types'

/** Canonical criterion order, used by every rubric. */
export const CRITERIA_ORDER = [
  'Engagement with the Muslim Community',
  'Qualifications and Capabilities',
  'Commitment to Civil Liberties',
  'Integrity and Ethics',
  'Policy Positions, Platform, & Vision',
  'Performance Record',
  'Stance on Foreign Policy',
  'Electability and Campaign Standing',
] as const

/** The 1-5 scale from the guide. */
export const SCORING_SCALE = [
  { score: 1, label: 'Very Poor' },
  { score: 2, label: 'Poor' },
  { score: 3, label: 'Fair' },
  { score: 4, label: 'Good' },
  { score: 5, label: 'Excellent' },
] as const

/** Both hard rules, verbatim in substance from the guide. */
export const DISQUALIFICATIONS = [
  'Candidates exhibiting hatred or contempt towards Muslims or their faith are automatically disqualified from endorsement, as such attitudes violate the principles of tolerance and respect on which this country is founded.',
  'MAPAC will not support candidates who support or condone the persecution or killing of Muslims abroad.',
] as const

export const ENDORSEMENT_REQUIREMENT =
  'MAPAC endorsements require direct contact between the endorsement team and the candidate.'

export const GUIDE_PDF_URL =
  'https://mapacnc.com/wp-content/uploads/2026/02/MAPAC-2026-Endorsement-Guide.pdf'

/**
 * The condensed principles, as the old Endorsement Guide page published them. The PDF's
 * fuller values outline is deliberately not reproduced here; see the spec's
 * "Endorsement guide detail level" decision.
 */
export const principles: Principle[] = [
  { id: 'religious-freedom', text: 'Protecting freedom of religion and civil liberties.' },
  {
    id: 'dignity',
    text: 'Respecting the dignity of all people and rejecting rhetoric that targets religious or immigrant communities.',
  },
  {
    id: 'moral-values',
    text: 'Upholding faith, family, moral values, and the sanctity of life.',
  },
  {
    id: 'justice',
    text: 'Committing to justice, honesty, and the equal application of the law.',
  },
  { id: 'education', text: 'Supporting parental rights and educational choice.' },
  {
    id: 'fiscal',
    text: 'Practicing fiscal responsibility to reduce burdens on working families.',
  },
  { id: 'overreach', text: 'Opposing government overreach and abuse of power.' },
  {
    id: 'domestic-priority',
    text: 'Prioritizing domestic needs over foreign wars and excessive foreign aid.',
  },
  {
    id: 'holy-sites',
    text: 'Protecting Muslim holy sites and access to worship in Jerusalem.',
  },
  {
    id: 'transparency',
    text: 'Advancing transparency, accountability, and limits on undue special-interest influence in government.',
  },
]

/** Descriptions are the guide's "most favorable description" for each criterion. */
export const criteria: Criterion[] = [
  {
    id: 'community-engagement',
    title: 'Engagement with the Muslim Community',
    description:
      'Exhibits understanding and actively engages in dialogue with the community, accepts our invitations and presents respectfully during attendance of candidate forums, and goes beyond statements of tolerance by involving our community in initiatives.',
  },
  {
    id: 'qualifications',
    title: 'Qualifications and Capabilities',
    description:
      'Relevant experience, education, and leadership skills, together with the ability to work with others, make decisions, and handle crises.',
  },
  {
    id: 'civil-liberties',
    title: 'Commitment to Civil Liberties',
    description:
      'Supports the Muslim community’s freedom to practice our faith, organize, and exercise our constitutional rights without fear of persecution. Supports ending the weaponization of government against the American people, including Fourth Amendment violations by government agencies and the lack of judicial oversight, and supports restoring civil liberties by repealing the Patriot Act and FISA. Appreciates the diversity of the American people, and supports unequivocally the constitutional right to protest peacefully and to boycott, divest from, and call for sanctions of any foreign entity.',
  },
  {
    id: 'integrity',
    title: 'Integrity and Ethics',
    description:
      'A record of honesty, transparency, and ethical behavior; willingness to take responsibility for actions and decisions; consistency in statements, promises, and actions over time; no strong leanings towards special interests or acceptance of Super PAC and corporate lobby money; and debates with civility, expressing disagreement in a manner fitting of a leader.',
  },
  {
    id: 'policy-vision',
    title: 'Policy Positions, Platform, & Vision',
    description:
      'Expresses well developed strategic plans for major issues such as healthcare, criminal justice and law enforcement, education, the economy, and the environment; offers a clear and compelling long-term vision for their constituency; aligns with MAPAC’s values and priorities; and proposes policies that are clear, practical, and achievable.',
  },
  {
    id: 'performance-record',
    title: 'Performance Record',
    description:
      'Evaluated on effectiveness, track record, and previous positions, whether public or private, and their performance there. Incumbents with a record of performing favorably and effectively are favored by this criterion; incumbents with a poor track record are penalized.',
  },
  {
    id: 'foreign-policy',
    title: 'Stance on Foreign Policy',
    description:
      'Vocal and adamant about stopping US interventionism, including involvement in foreign wars, and advocates focusing government resources on domestic issues that benefit the American public.',
  },
  {
    id: 'electability',
    title: 'Electability and Campaign Standing',
    description:
      'Shows public momentum through polling, media coverage, or grassroots engagement; runs a well-structured, disciplined campaign; demonstrates meaningful party and institutional support; is backed by credible individuals, coalitions, or movements; maintains transparent and ethical fundraising with a demonstrated ability to mobilize resources; and holds current office or relevant prior experience that strengthens credibility.',
  },
]

/**
 * Weight factors transcribed from the guide's five rubric tables, in CRITERIA_ORDER.
 * Percentage points are weight * 5; each row set must total 100.
 */
const WEIGHTS: Record<string, readonly number[]> = {
  'Local, City, and County Officials': [4, 2, 2, 3, 3, 3, 1, 2],
  Judiciary: [3, 3, 4, 4, 1, 2, 1, 2],
  'State Legislature': [3, 3, 3, 2, 3, 3, 1, 2],
  'State Executive Officials': [4, 3, 3, 3, 2, 2, 1, 2],
  'Federal Legislature': [3, 2, 2, 3, 2, 2, 4, 2],
}

const RUBRIC_IDS: Record<string, string> = {
  'Local, City, and County Officials': 'local',
  Judiciary: 'judiciary',
  'State Legislature': 'state-legislature',
  'State Executive Officials': 'state-executive',
  'Federal Legislature': 'federal-legislature',
}

export const rubrics: Rubric[] = Object.entries(WEIGHTS).map(([office, weights]) => ({
  id: RUBRIC_IDS[office],
  office,
  rows: CRITERIA_ORDER.map((criterion, i) => ({ criterion, weight: weights[i] })),
}))

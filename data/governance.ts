import type { GovernanceBody } from '@/lib/content/types'

/** MAPAC NC is composed of four bodies. Descriptions from the published bylaws text. */
export const governanceBodies: GovernanceBody[] = [
  {
    id: 'board-of-trustees',
    name: 'Board of Trustees',
    description:
      'The legislative body of MAPAC NC. It consists of not less than 7 nor more than fifteen (15) elected members drawn from the Voting Members of the General Body. Each member serves a period of three consecutive years.',
  },
  {
    id: 'executive-committee',
    name: 'Executive Committee',
    description:
      'The Executive Committee consists of the MAPAC President, who acts as its Chair, the Standing Committee Chairs, the MAPAC Secretary and the MAPAC Treasurer. Board of Trustees members are also considered pro forma members of the Executive Committee.',
  },
  {
    id: 'general-body',
    name: 'General Body',
    description:
      'The membership, in two groups. Voting Members are paid members who agree to the constitution and By Laws, have paid their dues, and maintain their membership as required. Associate Members are non-Muslim members of the community who join for personal reasons; they are exempt from voting and are not eligible for Board or Executive Committee membership, but enjoy all other benefits of membership, including discounted entry to events and free entry to educational events upon availability.',
  },
  {
    id: 'appointed-committees',
    name: 'Appointed Committees',
    description:
      'From time to time the Board or the Executive Committee may appoint ad hoc or standing committees. Their purpose is to distribute day-to-day tasks among members so they are completed in a timely manner, and to provide leadership training so the organization continuously develops future leaders.',
  },
]

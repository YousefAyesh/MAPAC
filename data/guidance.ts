import type { OfficeGuidance, ResearchCategory } from '@/lib/content/types'

export const officeGuidance: OfficeGuidance[] = [
  {
    id: 'local',
    office: 'Local offices',
    intro:
      'Virtually all North Carolina municipalities have adopted the Mayor-Council-City Manager form of government. Under this arrangement a Mayor has few direct powers, and to be effective must rely on their vision for effective city government, consensus-building skills, and communication skills. Mayoral candidates should be evaluated accordingly.',
    /**
     * Intentionally empty. The endorsement guide gives Local offices prose guidance
     * only -- its "Appropriate criteria for evaluation include:" bulleted list appears
     * under City Councils and County Commissioners, not here. Do not synthesise
     * bullets from the intro sentence; the intro IS the published guidance.
     */
    criteria: [],
  },
  {
    id: 'councils',
    office: 'City councils and county commissioners',
    intro:
      'City councils and county commissioners are deliberative bodies who can and should set policies, but whose direct executive powers are limited outside of the control of budgets and the appointment of members of various boards and special commissions.',
    criteria: [
      'Understanding of the statutory role and legal limitations imposed on city councils and county boards of commissioners',
      'Understanding of the proper roles of city and county managers and professional staffs',
      'Understanding of the interactive workings of various city and county appointed boards and commissions, and those of different professional staff organizations',
      'Understanding of the various review, permitting and other city and county approval processes',
      'Understanding of the budgetary process',
      'Understanding of capital funding and operational funding options available to cities and counties',
      'Commitment to affordable housing and increasing economic opportunity, particularly for the poor and lower middle class',
    ],
  },
  {
    id: 'education',
    office: 'Boards of education',
    intro:
      'Boards of education are somewhat like county commissioners and city councils, but with a much narrower scope of interests.',
    criteria: [
      'Commitment to and advocacy for publicly funded, universally available education',
      'Understanding of the statutory role and legal limitations of a board of education',
      'Understanding of the proper roles of professional staffs',
      'Understanding of the budgetary process and funding sources available to the county',
      'Having the confidence of, and sharing the general views of, one or more significant community segments — particularly parents, teachers, and the community groups whose backing is necessary for securing critical funding',
    ],
  },
  {
    id: 'judicial',
    office: 'Judicial offices',
    intro:
      'While federal judges are appointed by the executive branch subject to approval of the US Senate, in North Carolina all judge positions are decided by election. Vacancies created by retirements, deaths or other causes are filled by executive appointment, but only until the next regular election for that judgeship. Other than some extremely minimal requirements, it is the general electorate who decide on judicial candidates.',
    criteria: [
      'For Supreme Court and appellate court candidates: a thorough knowledge of the law, of legal precedents and principles, and of the proper workings of the overall court system. These courts act as courts of original jurisdiction only in extremely limited circumstances, and ordinarily consider points of law related to appealed lower-court rulings. Extensive legal proceedings experience and mastery of the more academic aspects of the law are major considerations.',
      'For lower court candidates: lower courts are where criminal proceedings, both misdemeanor and felony, are held, where civil suits are heard, and where family law matters are decided. Lower court judges deal more directly with the public and require more people skills and administrative skills, in addition to a sound understanding of the law and a commitment to justice within the law.',
    ],
  },
  {
    id: 'state-legislative',
    office: 'State legislative offices',
    intro:
      'The qualifications for State Senate and State House of Representatives are similar in many ways to those for city council and county commissioners, with some additional qualifications reflective of the unique nature of the State Legislature.',
    criteria: [
      'Understanding of the constitutional duties of the legislature, and the limitations the legislature has imposed on local units of government',
      'Understanding of the intricacies of the legislative approval process and committee system',
      'Commitment to the democratic process, and the elimination of gerrymandering and voter suppression methods used to directly or indirectly disenfranchise voters',
      'Commitment to civil rights and racial equality',
    ],
  },
]

export const researchCategories: ResearchCategory[] = [
  {
    id: 'campaign-websites',
    title: 'Official campaign websites',
    description:
      'Candidates’ official sites often provide their platforms, biographies, and positions on various issues.',
    links: [],
  },
  {
    id: 'social-media',
    title: 'Social media',
    description:
      'Candidates frequently use X, Facebook and Instagram to communicate their policies, respond to current events, and engage with the public.',
    links: [],
  },
  {
    id: 'government',
    title: 'Government websites',
    description:
      'For federal candidates, these sites provide records of legislative activities, sponsored bills, and voting history.',
    links: [
      { label: 'Congress.gov', url: 'https://www.congress.gov' },
      { label: 'Senate.gov', url: 'https://www.senate.gov' },
      { label: 'House.gov', url: 'https://www.house.gov' },
      { label: 'NC General Assembly votes', url: 'https://www.ncleg.gov/Legislation/Votes' },
    ],
  },
  {
    id: 'election-databases',
    title: 'Election databases',
    description:
      'Comprehensive information on candidates’ backgrounds, previous elections, and issue positions.',
    links: [
      { label: 'Ballotpedia', url: 'https://ballotpedia.org' },
      { label: 'VoteSmart', url: 'https://justfacts.votesmart.org' },
    ],
  },
  {
    id: 'fact-checking',
    title: 'Fact-checking sites',
    description: 'Verify the accuracy of candidates’ statements and claims.',
    links: [
      { label: 'PolitiFact', url: 'https://www.politifact.com' },
      { label: 'FactCheck.org', url: 'https://www.factcheck.org' },
    ],
  },
  {
    id: 'news',
    title: 'News outlets',
    description:
      'Coverage of candidates’ campaigns, controversies, and public appearances.',
    links: [],
  },
  {
    id: 'public-records',
    title: 'Public records databases',
    description:
      'State or local public records offices, for campaign finance, legal issues, or other relevant public records.',
    links: [],
  },
  {
    id: 'debates',
    title: 'Debates and interviews',
    description:
      'Recordings of debates, interviews, and speeches let you assess candidates’ communication skills and policy positions. Some of the best in North Carolina:',
    links: [
      { label: 'PBS North Carolina', url: 'https://www.youtube.com/@MyPBSNC/videos' },
      { label: 'WUNC Politics Podcast', url: 'https://www.npr.org/podcasts/477514874/w-u-n-c-politics' },
      {
        label: 'Do Politics Better',
        url: 'https://podcasts.apple.com/us/podcast/do-politics-better-podcast/id1557257071',
      },
    ],
  },
  {
    id: 'analysis',
    title: 'Political analysis sites',
    description: 'In-depth analysis of election data, polling, and political trends.',
    links: [
      // ABC shut FiveThirtyEight down in March 2025. The endorsement guide still lists it, so
      // the label stays (faithful to the guide) but the dead link does not.
      { label: 'FiveThirtyEight' },
      { label: 'The Cook Political Report', url: 'https://www.cookpolitical.com' },
    ],
  },
  {
    id: 'campaign-finance',
    title: 'Campaign finance reports',
    description:
      'Details of campaign contributions and expenditures — the FEC for federal candidates, state election boards for local candidates.',
    links: [
      { label: 'Federal Election Commission', url: 'https://www.fec.gov' },
      { label: 'NC State Board of Elections', url: 'https://www.ncsbe.gov' },
    ],
  },
]

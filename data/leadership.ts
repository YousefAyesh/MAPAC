import type { Person } from '@/lib/content/types'

/**
 * The year the published roster describes. The About page labels its heading with this,
 * so a stale roster reads as dated rather than as current. Update this and the roster
 * together when MAPAC confirms a new slate.
 */
export const leadershipYear = 2025

/**
 * Board of Trustees, verbatim from the About page. Officers in constitutional order
 * first, then the remaining trustees alphabetically by surname.
 * Twelve are named. The bylaws permit 7-15, so twelve is complete as published.
 */
export const trustees: Person[] = [
  { id: 'nabil-abdel-rahman', name: 'Dr. Nabil Abdel-Rahman', boardRole: 'Chair' },
  { id: 'hisham-mohamed', name: 'Dr Hisham Mohamed', boardRole: 'Vice-Chair' },
  { id: 'mohamed-kenawey', name: 'Mohamed Kenawey', boardRole: 'Treasurer' },
  { id: 'ahmad-herzallah', name: 'Ahmad Herzallah', boardRole: 'Secretary' },
  {
    id: 'majid-abdel-raziq',
    name: 'Majid Abdel-Raziq',
    executiveRole: 'Chair, Public Relations & Outreach Committee',
  },
  {
    id: 'mimi-aljabi',
    name: 'Dr. Mimi Aljabi',
    executiveRole: 'Chair, Political Action Committee',
  },
  { id: 'nigel-edwards', name: 'Nigel Edwards', executiveRole: 'President' },
  { id: 'ahmed-khalil', name: 'Dr. Ahmed Khalil', executiveRole: 'Chair, Education Committee' },
  { id: 'mohammad-omary', name: 'Mohammad Omary' },
  { id: 'shahid-shibbir', name: 'Shahid Shibbir', executiveRole: 'Chair, Media Committee' },
  { id: 'manal-sidawi', name: 'Manal Sidawi' },
  { id: 'amjad-syam', name: 'Amjad Syam' },
]

/**
 * Former trustees MAPAC acknowledges: "MAPAC acknowledges the outgoing Trustees and
 * honors their dedication and efforts to serve the Muslim community."
 */
export const outgoingTrustees: Person[] = [
  { id: 'khodr-zaarour', name: 'Dr. Khodr Zaarour' },
  { id: 'faisal-syed', name: 'Dr. Faisal Syed' },
  { id: 'aisha-shoman', name: 'Aisha Shoman' },
  { id: 'kanwal-naiyar', name: 'Kanwal Naiyar' },
  { id: 'ford-chambliss', name: 'Ford Chambliss' },
  { id: 'jihad-shawwa', name: 'Jihad Shawwa' },
  { id: 'musa-lipford', name: 'Musa Lipford' },
  { id: 'elham-idris', name: 'Elham Idris' },
  { id: 'fatima-anam', name: 'Fatima Anam' },
  { id: 'khalid-awan', name: 'Khalid Awan' },
  { id: 'sohaila-dar', name: 'Sohaila Dar' },
  { id: 'zainab-abdul-qaabidh-amir', name: 'Zainab Abdul-Qaabidh Amir' },
]

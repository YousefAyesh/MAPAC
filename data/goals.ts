import type { Goal } from '@/lib/content/types'

/**
 * Verbatim from the About page. The first six also appeared on the old home page;
 * `HOME_GOAL_COUNT` keeps Home and About reading one collection.
 */
export const goals: Goal[] = [
  {
    id: 'participate',
    text: 'Educate and encourage American Muslims to partake in the US political process.',
  },
  { id: 'lobby', text: 'Lobby Politicians at all levels within the US political system.' },
  {
    id: 'empowerment',
    text: 'Enhance the political empowerment of American Muslims at all levels of the American political process.',
  },
  {
    id: 'educate-policymakers',
    text: 'Educate American policy makers on issues of concern to Muslims and their impact on the local, national and global Muslim community.',
  },
  { id: 'present-tradition', text: 'Present Islamic tradition, values, history and culture.' },
  {
    id: 'interfaith',
    text: 'Foster inter-religious and inter-ethnic understanding, interaction and cooperation for enhancing the common good and dignity of all human beings.',
  },
  {
    id: 'human-rights',
    text: 'Strive for assurance of basic human rights of all Americans and of all Muslims.',
  },
  {
    id: 'anti-discrimination',
    text: 'Strive to eliminate in the American society any vestiges of discrimination on the basis of race, gender, religion or ethnicity.',
  },
]

export const HOME_GOAL_COUNT = 6

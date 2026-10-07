import type { Goal } from '@/lib/content/types'

/**
 * Verbatim from MAPAC's updated goals (Oct 2026). The first six also appeared on the old home page;
 * `HOME_GOAL_COUNT` keeps Home and About reading one collection.
 */
export const goals: Goal[] = [
  {
    id: 'participate',
    text: 'Encourage American Muslims to partake in the US political process.',
  },
  { id: 'engage', text: 'Engage with politicians at all levels within the US political system.' },
  {
    id: 'empowerment',
    text: 'Enhance the political empowerment of American Muslims at all levels of the American political process.',
  },
  {
    id: 'inform-policymakers',
    text: 'Inform American policy makers on issues of concern to Muslims and their impact on the local, national and global Muslim community.',
  },
  { id: 'embody-tradition', text: 'Embody Islamic tradition, values, history and culture.' },
  {
    id: 'interfaith',
    text: 'Foster inter-religious and inter-ethnic understanding, interaction and cooperation for enhancing the common good and dignity of all human beings.',
  },
  {
    id: 'human-rights',
    text: 'Aim for assurance of basic human rights of all Americans and of all Muslims.',
  },
  {
    id: 'anti-discrimination',
    text: 'Strive to eliminate in the American society any vestiges of discrimination on the basis of race, gender, religion or ethnicity.',
  },
]

export const HOME_GOAL_COUNT = 6

import { goals } from '@/data/goals'
import { pillars } from '@/data/pillars'
import type { ContentSource } from '../source'

export const localSource: ContentSource = {
  async getGoals() {
    return goals
  },
  async getPillars() {
    return pillars
  },
  async getGovernanceBodies() {
    throw new Error('not implemented: getGovernanceBodies (Task 6)')
  },
  async getTrustees() {
    throw new Error('not implemented: getTrustees (Task 6)')
  },
  async getExecutiveCommittee() {
    throw new Error('not implemented: getExecutiveCommittee (Task 6)')
  },
  async getOutgoingTrustees() {
    throw new Error('not implemented: getOutgoingTrustees (Task 6)')
  },
  async getLeadershipYear() {
    throw new Error('not implemented: getLeadershipYear (Task 6)')
  },
  async getPrinciples() {
    throw new Error('not implemented: getPrinciples (Task 7)')
  },
  async getCriteria() {
    throw new Error('not implemented: getCriteria (Task 7)')
  },
  async getRubrics() {
    throw new Error('not implemented: getRubrics (Task 7)')
  },
  async getOfficeGuidance() {
    throw new Error('not implemented: getOfficeGuidance (Task 7)')
  },
  async getResearchCategories() {
    throw new Error('not implemented: getResearchCategories (Task 7)')
  },
  async getEndorsements() {
    throw new Error('not implemented: getEndorsements (Task 8)')
  },
  async getNews() {
    throw new Error('not implemented: getNews (Task 9)')
  },
  async getNewsBySlug() {
    throw new Error('not implemented: getNewsBySlug (Task 9)')
  },
}

import { criteria, principles, rubrics } from '@/data/endorsement'
import { goals } from '@/data/goals'
import { governanceBodies } from '@/data/governance'
import { leadershipYear, outgoingTrustees, trustees } from '@/data/leadership'
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
    return governanceBodies
  },
  async getTrustees() {
    return trustees
  },
  async getExecutiveCommittee() {
    return trustees.filter((p) => p.executiveRole)
  },
  async getOutgoingTrustees() {
    return outgoingTrustees
  },
  async getLeadershipYear() {
    return leadershipYear
  },
  async getPrinciples() {
    return principles
  },
  async getCriteria() {
    return criteria
  },
  async getRubrics() {
    return rubrics
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

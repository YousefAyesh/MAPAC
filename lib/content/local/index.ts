import { criteria, principles, rubrics } from '@/data/endorsement'
import { endorsements } from '@/data/endorsements'
import { goals } from '@/data/goals'
import { governanceBodies } from '@/data/governance'
import { officeGuidance, researchCategories } from '@/data/guidance'
import { leadershipYear, outgoingTrustees, trustees } from '@/data/leadership'
import { pillars } from '@/data/pillars'
import type { ContentSource } from '../source'
import { getNews, getNewsBySlug } from './news'

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
    return officeGuidance
  },
  async getResearchCategories() {
    return researchCategories
  },
  async getEndorsements() {
    return endorsements
  },
  getNews,
  getNewsBySlug,
}

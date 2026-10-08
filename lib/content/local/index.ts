import {
  criteria,
  DISQUALIFICATIONS,
  ENDORSEMENT_REQUIREMENT,
  GUIDE_PDF_URL,
  principles,
  rubrics,
  SCORING_SCALE,
} from '@/data/endorsement'
import { endorsements } from '@/data/endorsements'
import { events, upcomingEvents } from '@/data/events'
import { goals } from '@/data/goals'
import { governanceBodies } from '@/data/governance'
import { officeGuidance, researchCategories } from '@/data/guidance'
import { leadershipYear, outgoingTrustees, trustees } from '@/data/leadership'
import { galleryPhotos } from '@/data/photos'
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
  async getScoringScale() {
    return [...SCORING_SCALE]
  },
  async getDisqualifications() {
    return [...DISQUALIFICATIONS]
  },
  async getEndorsementRequirement() {
    return ENDORSEMENT_REQUIREMENT
  },
  async getEndorsementGuideUrl() {
    return GUIDE_PDF_URL
  },
  async getOfficeGuidance() {
    return officeGuidance
  },
  async getResearchCategories() {
    return researchCategories
  },
  async getUpcomingEvents() {
    return upcomingEvents(events)
  },
  async getEndorsements() {
    return endorsements
  },
  async getGalleryPhotos() {
    return galleryPhotos
  },
  getNews,
  getNewsBySlug,
}

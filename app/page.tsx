import { CtaBand } from '@/components/home/CtaBand'
import { LatestSection } from '@/components/home/LatestSection'
import { GoalsGrid } from '@/components/home/GoalsGrid'
import { Hero } from '@/components/home/Hero'
import { PillarsRow } from '@/components/home/PillarsRow'
import { HOME_GOAL_COUNT } from '@/data/goals'

export default function HomePage() {
  return (
    <>
      <Hero />
      <LatestSection />
      <PillarsRow />
      <GoalsGrid limit={HOME_GOAL_COUNT} />
      <CtaBand />
    </>
  )
}

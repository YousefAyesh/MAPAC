import type { Metadata } from 'next'
import { GovernanceSection } from '@/components/about/GovernanceSection'
import { LeadershipSection } from '@/components/about/LeadershipSection'
import { GoalsGrid } from '@/components/home/GoalsGrid'
import { Section } from '@/components/ui/Section'
import { site } from '@/data/site'

export const metadata: Metadata = {
  title: 'About',
  description: site.whatWeDo,
}

export default function AboutPage() {
  return (
    <>
      <Section aria-labelledby="about-heading">
        <h1 id="about-heading" className="text-3xl">
          About MAPAC
        </h1>
        <h2 className="mt-10 text-2xl">What we do</h2>
        <p className="mt-3 max-w-3xl leading-relaxed">{site.whatWeDo}</p>
      </Section>

      {/* No limit: About shows all eight goals. */}
      <GoalsGrid />

      <GovernanceSection />
      <LeadershipSection />
    </>
  )
}

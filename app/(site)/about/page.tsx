import type { Metadata } from 'next'
import { GovernanceSection } from '@/components/about/GovernanceSection'
import { LeadershipSection } from '@/components/about/LeadershipSection'
import { GoalsGrid } from '@/components/home/GoalsGrid'
import { Photo } from '@/components/ui/Photo'
import { Section } from '@/components/ui/Section'
import { photo } from '@/data/photos'
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
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_22rem] lg:items-center">
          <div>
            <h2 className="text-2xl">What we do</h2>
            <p className="mt-3 max-w-3xl leading-relaxed">{site.whatWeDo}</p>
          </div>
          <Photo
            photo={photo.dinner_speaker_mapac_sign}
            // Native 3:2, so the photographer's burned-in credit is not cropped.
            aspect="aspect-[3/2]"
            sizes="(max-width: 1024px) 100vw, 22rem"
          />
        </div>
      </Section>

      {/* No limit: About shows all eight goals. */}
      <GoalsGrid />

      <GovernanceSection />
      <LeadershipSection />
    </>
  )
}

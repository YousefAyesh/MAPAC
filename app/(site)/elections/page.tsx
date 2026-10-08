import type { Metadata } from 'next'
import { CriteriaAccordion } from '@/components/elections/CriteriaAccordion'
import { EndorsementsSection } from '@/components/elections/EndorsementsSection'
import { OfficeGuidance } from '@/components/elections/OfficeGuidance'
import { ResearchResources } from '@/components/elections/ResearchResources'
import { RubricTable } from '@/components/elections/RubricTable'
import { Button } from '@/components/ui/Button'
import { Photo } from '@/components/ui/Photo'
import { Section } from '@/components/ui/Section'
import { photo } from '@/data/photos'
import { content } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Elections & Endorsements',
  description:
    'How MAPAC evaluates and endorses candidates: our principles, the eight evaluation criteria, and the weighted scoring rubrics for each level of office.',
}

// Endorsements MAPAC publishes in Sanity appear within a minute. Must match REVALIDATE_SECONDS.
export const revalidate = 60

export default async function ElectionsPage() {
  const [principles, rubrics, scoringScale, disqualifications, requirement, guideUrl] =
    await Promise.all([
      content.getPrinciples(),
      content.getRubrics(),
      content.getScoringScale(),
      content.getDisqualifications(),
      content.getEndorsementRequirement(),
      content.getEndorsementGuideUrl(),
    ])

  return (
    <>
      <Section aria-labelledby="elections-heading">
        <h1 id="elections-heading" className="text-3xl">
          Elections &amp; endorsements
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed">
          MAPAC evaluates candidates based on alignment with core principles rooted in Islamic
          values and American constitutional ideals.
        </p>
        <div className="mt-6">
          <Button
            href={guideUrl}
            variant="ghost"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read the full 2026 Endorsement Guide (PDF)
          </Button>
        </div>
      </Section>

      <EndorsementsSection />

      <Section aria-labelledby="engagement-photo" className="!pt-0">
        <h2 id="engagement-photo" className="sr-only">
          MAPAC at work
        </h2>
        <Photo
          photo={photo.forum_panel_wide}
          aspect="aspect-[21/9]"
          sizes="(max-width: 1024px) 100vw, 64rem"
        />
      </Section>

      <Section tinted aria-labelledby="principles-heading">
        <h2 id="principles-heading" className="text-2xl">
          Our principles
        </h2>
        <ul className="mt-6 grid max-w-4xl gap-4 sm:grid-cols-2">
          {principles.map((p) => (
            <li key={p.id} className="flex gap-3">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-crimson" />
              <span className="leading-relaxed">{p.text}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section aria-labelledby="criteria-heading">
        <h2 id="criteria-heading" className="text-2xl">
          How we evaluate candidates
        </h2>
        <p className="mt-3 max-w-3xl leading-relaxed">
          Candidates are scored on eight criteria according to how favorably they align with
          MAPAC&rsquo;s criteria. Each criterion is scored from 1 to 5:{' '}
          {scoringScale.map((s) => `${s.score} ${s.label}`).join(', ')}.
        </p>
        <p className="mt-3 max-w-3xl leading-relaxed">{requirement}</p>
        <CriteriaAccordion />
      </Section>

      <Section tinted aria-labelledby="disqualification-heading">
        <h2 id="disqualification-heading" className="text-2xl">
          Automatic disqualification
        </h2>
        <ul className="mt-6 max-w-3xl space-y-4">
          {disqualifications.map((rule) => (
            <li
              key={rule.slice(0, 24)}
              className="border-l-4 border-crimson bg-white p-5 leading-relaxed"
            >
              {rule}
            </li>
          ))}
        </ul>
      </Section>

      <Section aria-labelledby="rubrics-heading">
        <h2 id="rubrics-heading" className="text-2xl">
          Scoring rubrics
        </h2>
        <p className="mt-3 max-w-3xl leading-relaxed">
          The office a candidate seeks determines which weighting scheme applies. Every rubric
          totals 100 possible points.
        </p>
        <div className="mt-10 space-y-12">
          {rubrics.map((rubric) => (
            <RubricTable key={rubric.id} rubric={rubric} />
          ))}
        </div>
      </Section>

      <Section tinted aria-labelledby="office-guidance-heading">
        <h2 id="office-guidance-heading" className="text-2xl">
          What we look for at each level of office
        </h2>
        <p className="mt-3 max-w-3xl leading-relaxed">
          Qualifications and policy criteria differ by the office a candidate seeks. These notes
          explain what MAPAC weighs at each level.
        </p>
        <OfficeGuidance />
      </Section>

      <Section aria-labelledby="research-heading">
        <h2 id="research-heading" className="text-2xl">
          Researching candidates yourself
        </h2>
        <p className="mt-3 max-w-3xl leading-relaxed">
          MAPAC&rsquo;s endorsement guide lists these tools and sources for researching a
          candidate&rsquo;s background, policies, and public record.
        </p>
        <ResearchResources />
      </Section>
    </>
  )
}

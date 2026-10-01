import { Photo } from '@/components/ui/Photo'
import { Section } from '@/components/ui/Section'
import { photos } from '@/data/photos'
import { content } from '@/lib/content'

export async function GovernanceSection() {
  const bodies = await content.getGovernanceBodies()

  return (
    <Section aria-labelledby="governance-heading">
      <h2 id="governance-heading" className="text-2xl">
        Governance
      </h2>
      <p className="mt-3 max-w-2xl leading-relaxed">
        MAPAC NC is composed of four bodies.
      </p>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_20rem] lg:items-start">
        <dl className="space-y-8">
          {bodies.map((body) => (
            <div key={body.id}>
              <dt className="font-serif text-lg font-semibold text-navy">{body.name}</dt>
              <dd className="mt-2 max-w-3xl leading-relaxed">{body.description}</dd>
            </div>
          ))}
        </dl>
        <Photo
          photo={photos.meeting}
          aspect="aspect-[3/4]"
          sizes="(max-width: 1024px) 100vw, 20rem"
        />
      </div>
    </Section>
  )
}

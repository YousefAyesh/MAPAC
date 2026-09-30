import { Section } from '@/components/ui/Section'
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
      <dl className="mt-8 space-y-8">
        {bodies.map((body) => (
          <div key={body.id}>
            <dt className="font-serif text-lg font-semibold text-navy">{body.name}</dt>
            <dd className="mt-2 max-w-3xl leading-relaxed">{body.description}</dd>
          </div>
        ))}
      </dl>
    </Section>
  )
}

import { Card } from '@/components/ui/Card'
import { Section } from '@/components/ui/Section'
import { content } from '@/lib/content'

export async function PillarsRow() {
  const pillars = await content.getPillars()

  return (
    <Section tinted aria-labelledby="pillars-heading">
      <h2 id="pillars-heading" className="text-2xl">
        How MAPAC works
      </h2>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {pillars.map((pillar) => (
          <Card key={pillar.id}>
            <h3 className="text-lg">{pillar.title}</h3>
            <p className="mt-3 text-sm leading-relaxed">{pillar.body}</p>
          </Card>
        ))}
      </div>
    </Section>
  )
}

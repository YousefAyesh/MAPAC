import { Card } from '@/components/ui/Card'
import { Photo } from '@/components/ui/Photo'
import { Section } from '@/components/ui/Section'
import { photos } from '@/data/photos'
import { content } from '@/lib/content'

export async function PillarsRow() {
  const pillars = await content.getPillars()

  return (
    <Section tinted aria-labelledby="pillars-heading">
      <Photo
        photo={photos.forumBanner}
        aspect="aspect-[16/9]"
        sizes="(max-width: 1024px) 100vw, 64rem"
        className="mb-12"
      />
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

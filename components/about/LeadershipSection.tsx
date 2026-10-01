import { PersonCard } from '@/components/about/PersonCard'
import { Photo } from '@/components/ui/Photo'
import { Section } from '@/components/ui/Section'
import { photo } from '@/data/photos'
import { content } from '@/lib/content'

export async function LeadershipSection() {
  const [trustees, executive, outgoing, year] = await Promise.all([
    content.getTrustees(),
    content.getExecutiveCommittee(),
    content.getOutgoingTrustees(),
    content.getLeadershipYear(),
  ])

  return (
    <Section tinted aria-labelledby="leadership-heading">
      <h2 id="leadership-heading" className="text-2xl">
        Leadership
      </h2>

      <h3 className="mt-8 text-lg">{year} Board of Trustees</h3>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {trustees.map((person) => (
          <li key={person.id}>
            <PersonCard person={person} />
          </li>
        ))}
      </ul>

      <h3 className="mt-12 text-lg">{year} Executive Committee</h3>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {executive.map((person) => (
          <li key={person.id}>
            <div className="rounded-lg border border-border-subtle bg-white p-5">
              <p className="font-serif text-base font-semibold text-navy">{person.name}</p>
              <p className="mt-1 text-sm text-body">{person.executiveRole}</p>
            </div>
          </li>
        ))}
      </ul>

      <Photo
        photo={photo.dinner_recognition}
        aspect="aspect-[16/9]"
        sizes="(max-width: 1024px) 100vw, 64rem"
        className="mt-12"
      />

      <h3 className="mt-12 text-lg">With thanks to our outgoing trustees</h3>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed">
        MAPAC acknowledges the outgoing Trustees and honors their dedication and efforts to
        serve the Muslim community.
      </p>
      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
        {outgoing.map((person) => (
          <li key={person.id} className="text-sm text-body">
            {person.name}
          </li>
        ))}
      </ul>
    </Section>
  )
}

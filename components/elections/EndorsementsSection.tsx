import { Section } from '@/components/ui/Section'
import { groupByCycle } from '@/data/endorsements'
import { content } from '@/lib/content'

export async function EndorsementsSection() {
  const endorsements = await content.getEndorsements()

  // No published endorsements means no section at all — not an empty state.
  if (endorsements.length === 0) return null

  const groups = groupByCycle(endorsements)

  return (
    <Section tinted aria-labelledby="endorsements-heading">
      <h2 id="endorsements-heading" className="text-2xl">
        Our endorsements
      </h2>
      {groups.map((group) => (
        <div key={group.cycle} className="mt-8">
          <h3 className="text-lg">{group.cycle}</h3>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {group.endorsements.map((e) => (
              <li key={e.id} className="rounded-lg border border-border-subtle bg-white p-5">
                <p className="font-serif text-base font-semibold text-navy">{e.candidate}</p>
                <p className="mt-1 text-sm text-body">{e.office}</p>
                {e.statementUrl && (
                  <a
                    href={e.statementUrl}
                    className="mt-3 inline-block text-sm font-medium text-crimson-deep underline"
                  >
                    Read the statement
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </Section>
  )
}

import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { content } from '@/lib/content'

export async function GoalsGrid({ limit }: { limit?: number }) {
  const all = await content.getGoals()
  const goals = typeof limit === 'number' ? all.slice(0, limit) : all

  return (
    <Section aria-labelledby="goals-heading">
      <h2 id="goals-heading" className="text-2xl">
        Our goals
      </h2>
      <ol className="mt-8 grid gap-6 sm:grid-cols-2">
        {goals.map((goal, i) => (
          <li key={goal.id} className="flex gap-4">
            <span
              aria-hidden="true"
              className="font-serif text-xl font-semibold text-crimson"
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <p className="leading-relaxed">{goal.text}</p>
          </li>
        ))}
      </ol>
      {typeof limit === 'number' && all.length > limit && (
        <div className="mt-8">
          <Button href="/about" variant="ghost">
            Read all {all.length} goals
          </Button>
        </div>
      )}
    </Section>
  )
}

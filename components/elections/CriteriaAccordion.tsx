import { Disclosure } from '@/components/ui/Disclosure'
import { content } from '@/lib/content'

export async function CriteriaAccordion() {
  const criteria = await content.getCriteria()

  return (
    <div className="mt-8 border-t border-border-subtle">
      {criteria.map((criterion, i) => (
        <Disclosure key={criterion.id} summary={`${i + 1}. ${criterion.title}`}>
          {criterion.description}
        </Disclosure>
      ))}
    </div>
  )
}

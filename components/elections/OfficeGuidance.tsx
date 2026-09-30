import { Disclosure } from '@/components/ui/Disclosure'
import { content } from '@/lib/content'

export async function OfficeGuidance() {
  const guidance = await content.getOfficeGuidance()

  return (
    <div className="mt-8 border-t border-border-subtle">
      {guidance.map((group) => (
        <Disclosure key={group.id} summary={group.office}>
          <p>{group.intro}</p>
          {group.criteria.length > 0 && (
            <>
              <p className="mt-4 font-medium text-navy">Appropriate criteria for evaluation:</p>
              <ul className="mt-2 list-disc space-y-2 pl-6">
                {group.criteria.map((criterion) => (
                  <li key={criterion.slice(0, 32)}>{criterion}</li>
                ))}
              </ul>
            </>
          )}
        </Disclosure>
      ))}
    </div>
  )
}

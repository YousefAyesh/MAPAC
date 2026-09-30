import type { Person } from '@/lib/content/types'

export function PersonCard({ person }: { person: Person }) {
  const role = person.boardRole ?? person.executiveRole

  return (
    <div className="rounded-lg border border-border-subtle bg-white p-5">
      <p className="font-serif text-base font-semibold text-navy">{person.name}</p>
      {role && <p className="mt-1 text-sm text-body">{role}</p>}
    </div>
  )
}

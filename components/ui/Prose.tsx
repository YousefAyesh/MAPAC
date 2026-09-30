import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/** Readable long-form text column. Links use crimson-deep (AAA) not crimson (AA). */
export function Prose({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'max-w-prose space-y-4 text-base leading-relaxed [&_a]:font-medium [&_a]:text-crimson-deep [&_a]:underline [&_h2]:mt-10 [&_h2]:text-2xl [&_h3]:mt-8 [&_h3]:text-xl [&_li]:leading-relaxed [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6',
        className
      )}
    >
      {children}
    </div>
  )
}

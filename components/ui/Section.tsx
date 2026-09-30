import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Props = {
  children: ReactNode
  /** Tints the section background with the surface token, for alternating bands. */
  tinted?: boolean
  className?: string
} & Omit<ComponentProps<'section'>, 'className' | 'children'>

export function Section({ children, tinted = false, className = '', ...rest }: Props) {
  return (
    <section
      className={cn(tinted ? 'bg-surface' : 'bg-white', 'px-5 py-16 sm:px-8 sm:py-20', className)}
      {...rest}
    >
      <div className="mx-auto w-full max-w-5xl">{children}</div>
    </section>
  )
}

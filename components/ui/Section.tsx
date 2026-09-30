import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  /** Tints the section background with the surface token, for alternating bands. */
  tinted?: boolean
  className?: string
  id?: string
  'aria-labelledby'?: string
}

export function Section({ children, tinted = false, className = '', id, ...rest }: Props) {
  return (
    <section
      id={id}
      className={`${tinted ? 'bg-surface' : 'bg-white'} px-5 py-16 sm:px-8 sm:py-20 ${className}`.trim()}
      {...rest}
    >
      <div className="mx-auto w-full max-w-5xl">{children}</div>
    </section>
  )
}

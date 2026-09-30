import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-crimson text-white hover:bg-crimson-deep',
  secondary: 'bg-navy text-white hover:bg-navy-800',
  ghost: 'bg-transparent text-navy border border-border-subtle hover:bg-surface',
}

// min-h-11 is 44px — the spec's minimum touch target.
const BASE =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded px-5 text-sm font-semibold transition-colors'

type Props = {
  children: ReactNode
  variant?: Variant
  href?: string
  className?: string
} & Omit<ComponentProps<'button'>, 'className' | 'children'>

export function Button({
  children,
  variant = 'primary',
  href,
  className = '',
  ...rest
}: Props) {
  const classes = `${BASE} ${VARIANTS[variant]} ${className}`.trim()

  if (href) {
    const external = href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')
    if (external) {
      return (
        <a href={href} className={classes}>
          {children}
        </a>
      )
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  )
}

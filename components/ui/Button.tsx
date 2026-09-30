import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-crimson text-white hover:bg-crimson-deep',
  secondary: 'bg-navy text-white hover:bg-navy-800',
  ghost: 'bg-transparent text-navy border border-border-subtle hover:bg-surface',
}

// min-h-11 is 44px — the spec's minimum touch target.
const BASE =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded px-5 text-sm font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none'

// A scheme (http:, mailto:, tel:, ...) or a protocol-relative "//" prefix means the
// link leaves the Next.js app, so it must render as a plain <a>, not <Link> — <Link>
// would treat "//example.com" as an internal path and misroute it.
const EXTERNAL_HREF = /^([a-z][a-z0-9+.-]*:)?\/\//i

type CommonProps = {
  children: ReactNode
  variant?: Variant
  className?: string
}

type AnchorProps = CommonProps &
  Omit<ComponentProps<'a'>, 'className' | 'children' | 'href'> & { href: string }

type ButtonElementProps = CommonProps &
  Omit<ComponentProps<'button'>, 'className' | 'children'> & { href?: never }

type Props = AnchorProps | ButtonElementProps

export function Button({
  children,
  variant = 'primary',
  className = '',
  href,
  ...attrs
}: Props) {
  const classes = cn(BASE, VARIANTS[variant], className)

  if (href) {
    const external =
      EXTERNAL_HREF.test(href) || href.startsWith('mailto:') || href.startsWith('tel:')
    const anchorAttrs = attrs as Omit<ComponentProps<'a'>, 'className' | 'children' | 'href'>

    if (external) {
      return (
        <a {...anchorAttrs} href={href} className={classes}>
          {children}
        </a>
      )
    }

    return (
      <Link {...anchorAttrs} href={href} className={classes}>
        {children}
      </Link>
    )
  }

  const buttonAttrs = attrs as Omit<ComponentProps<'button'>, 'className' | 'children'>

  return (
    <button type="button" {...buttonAttrs} className={classes}>
      {children}
    </button>
  )
}

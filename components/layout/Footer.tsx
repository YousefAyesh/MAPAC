import Link from 'next/link'
import { footerNav } from '@/data/nav'
import { site } from '@/data/site'

const SOCIAL: { label: string; href: string }[] = [
  { label: 'Instagram', href: site.social.instagram },
  { label: 'Facebook', href: site.social.facebook },
  { label: 'YouTube', href: site.social.youtube },
]

export function Footer() {
  return (
    <footer className="bg-navy px-5 py-14 text-white on-navy sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="font-serif text-lg font-semibold text-white">{site.shortName}</p>
          <p className="mt-2 max-w-xs text-sm text-white/70">{site.tagline}</p>
        </div>

        <nav aria-label="Footer">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white">Navigation</h2>
          <ul className="mt-3 space-y-1">
            {footerNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-white/80 underline-offset-2 hover:text-white hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white">Contact</h2>
          <address className="mt-3 space-y-1 text-sm not-italic text-white/80">
            <p>{site.address.line1}</p>
            <p>{site.address.line2}</p>
            <p>
              <a href={site.phoneHref} className="underline-offset-2 hover:text-white hover:underline">
                {site.phone}
              </a>
            </p>
            <p>
              <a href={`mailto:${site.email}`} className="underline-offset-2 hover:text-white hover:underline">
                {site.email}
              </a>
            </p>
          </address>

          <ul className="mt-4 flex gap-4">
            {SOCIAL.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  className="text-sm text-white/80 underline-offset-2 hover:text-white hover:underline"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl border-t border-navy-700 pt-6 text-xs text-white/60">
        <p>
          &copy; {new Date().getFullYear()} {site.shortName}. All rights reserved.{' '}
          <Link href="/privacy-policy" className="underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </footer>
  )
}

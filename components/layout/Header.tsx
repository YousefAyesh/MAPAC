import Link from 'next/link'
import { primaryNav } from '@/data/nav'
import { site } from '@/data/site'
import { MobileNav } from './MobileNav'

export function Header() {
  return (
    <header className="relative bg-navy on-navy">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-baseline gap-2 text-white">
          <span className="font-serif text-xl font-semibold tracking-tight">{site.shortName}</span>
          <span className="hidden text-xs text-white/70 lg:inline">{site.name}</span>
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex min-h-11 items-center rounded px-3 text-sm font-medium text-white/90 hover:bg-navy-800 hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <MobileNav />
      </div>
    </header>
  )
}

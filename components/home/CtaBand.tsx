import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function CtaBand() {
  return (
    <section className="bg-navy px-5 py-16 on-navy sm:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {/* on-navy on the section already flips --heading-color to white. */}
          <h2 className="text-2xl">Connect with us</h2>
          <p className="mt-2 max-w-md text-white/80">
            Join MAPAC as a member or sign up for our contact list to stay informed.
          </p>
          <p className="mt-3 text-sm">
            <Link href="/elections" className="font-medium text-white underline underline-offset-4">
              See how MAPAC evaluates and endorses candidates
            </Link>
          </p>
        </div>
        <Button href="/get-involved">Get involved</Button>
      </div>
    </section>
  )
}

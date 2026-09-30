import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'

export default function NotFound() {
  return (
    <Section>
      <p className="font-serif text-sm font-semibold uppercase tracking-widest text-crimson">
        404
      </p>
      <h1 className="mt-3 text-3xl">We couldn&rsquo;t find that page</h1>
      <p className="mt-4 max-w-xl leading-relaxed">
        The page may have moved, or the link may be out of date.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/">Go to the home page</Button>
        <Button href="/contact" variant="ghost">
          Contact MAPAC
        </Button>
      </div>
    </Section>
  )
}

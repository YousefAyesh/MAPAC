import { Button } from '@/components/ui/Button'
import { site } from '@/data/site'

export function Hero() {
  return (
    <section className="bg-navy px-5 py-20 on-navy sm:px-8 sm:py-28">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-white/60">
          {site.name}
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">{site.tagline}</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80">{site.mission}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/get-involved">Get involved</Button>
          <Button href="/donate" variant="ghost" className="!border-white/30 !text-white hover:!bg-white/10">
            Donate
          </Button>
        </div>
      </div>
    </section>
  )
}

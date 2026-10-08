import { Button } from '@/components/ui/Button'
import { Photo } from '@/components/ui/Photo'
import { photo } from '@/data/photos'
import { site } from '@/data/site'

export function Hero() {
  return (
    <section className="bg-navy px-5 py-20 on-navy sm:px-8 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_26rem]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-white/60">
            {site.name}
          </p>
          <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">{site.tagline}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80">{site.mission}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/get-involved">Get involved</Button>
            <Button href="/donate" variant="ghost" className="!border-white/40 !text-white hover:!bg-white/10">
              Donate
            </Button>
          </div>
        </div>
        <Photo
          photo={photo.dinner_hall_wide}
          // Native 3:2, so the photographer's burned-in credit is not cropped.
          aspect="aspect-[3/2]"
          sizes="(max-width: 1024px) 100vw, 26rem"
          className="shadow-2xl"
          preload
        />
      </div>
    </section>
  )
}

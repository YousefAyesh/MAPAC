import { Button } from '@/components/ui/Button'
import { Photo } from '@/components/ui/Photo'
import { Section } from '@/components/ui/Section'
import { photo } from '@/data/photos'

/**
 * One photograph from each kind of MAPAC event, none used elsewhere on Home. Credited
 * annual-dinner frames are left out: the uniform 4:3 cells would crop their credit line.
 */
const MOSAIC = [
  photo.iftar_proclamation,
  photo.forum_2018_audience,
  photo.iftar_remarks,
  photo.forum_panel_speaker,
  photo.community_families,
]

export function PhotoMosaic() {
  const [lead, ...rest] = MOSAIC

  return (
    <Section aria-labelledby="community-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="community-heading" className="text-2xl">
            MAPAC in the community
          </h2>
          <p className="mt-3 max-w-2xl leading-relaxed">
            Candidate forums, iftars, planning sessions and our annual dinner.
          </p>
        </div>
        <Button href="/gallery" variant="ghost">
          See the gallery
        </Button>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Photo
          photo={lead}
          aspect="aspect-[4/3] lg:aspect-auto lg:h-full"
          sizes="(max-width: 1024px) 100vw, 32rem"
          className="col-span-2 lg:row-span-2"
        />
        {rest.map((p) => (
          <Photo
            key={p.id}
            photo={p}
            aspect="aspect-[4/3]"
            sizes="(max-width: 1024px) 50vw, 16rem"
          />
        ))}
      </div>
    </Section>
  )
}

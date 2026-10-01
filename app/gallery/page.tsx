import type { Metadata } from 'next'
import { Photo } from '@/components/ui/Photo'
import { Section } from '@/components/ui/Section'
import { DINNER_PHOTO_CREDIT, galleryPhotos } from '@/data/photos'

export const metadata: Metadata = {
  title: 'Gallery',
  description:
    'Photographs from MAPAC community forums, planning sessions, and the annual dinner.',
}

export default function GalleryPage() {
  const groups = galleryPhotos.reduce<Record<string, typeof galleryPhotos>>((acc, photo) => {
    ;(acc[photo.group] ??= []).push(photo)
    return acc
  }, {})

  return (
    <Section aria-labelledby="gallery-heading">
      <h1 id="gallery-heading" className="text-3xl">
        Gallery
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed">
        Photographs from MAPAC community forums, planning sessions, and the annual dinner.
      </p>

      {Object.entries(groups).map(([group, items]) => (
        <section key={group} className="mt-12" aria-labelledby={`group-${group.replace(/\s+/g, '-')}`}>
          <h2 id={`group-${group.replace(/\s+/g, '-')}`} className="text-2xl">
            {group}
          </h2>
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((photo) => (
              <li key={photo.id}>
                <Photo
                  photo={photo}
                  aspect="aspect-[4/3]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20rem"
                />
              </li>
            ))}
          </ul>
        </section>
      ))}

      <p className="mt-12 text-sm text-body">{DINNER_PHOTO_CREDIT}</p>
    </Section>
  )
}

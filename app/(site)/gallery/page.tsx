import type { Metadata } from 'next'
import { Photo } from '@/components/ui/Photo'
import { Section } from '@/components/ui/Section'
import { PHOTO_CREDIT } from '@/data/photos'
import { content, type Photo as PhotoData } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Gallery',
  description:
    'Photographs from MAPAC community forums, planning sessions, and the annual dinner.',
}

// Photos MAPAC publishes in Sanity appear within a minute. Must match REVALIDATE_SECONDS.
export const revalidate = 60

/** A heading id from an editor-typed group name, which may contain any characters. */
function groupId(group: string) {
  return `group-${group.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
}

export default async function GalleryPage() {
  const photos = await content.getGalleryPhotos()
  const groups = photos.reduce<Record<string, PhotoData[]>>((acc, photo) => {
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
        <section key={group} className="mt-12" aria-labelledby={groupId(group)}>
          <h2 id={groupId(group)} className="text-2xl">
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

      <p className="mt-12 text-sm text-body">{PHOTO_CREDIT}</p>
    </Section>
  )
}

import NextImage from 'next/image'
import type { Photo as PhotoData } from '@/data/photos'
import { cn } from '@/lib/cn'

/**
 * A photograph in a fixed-aspect frame. Keeps `sizes` consistent across call sites so the
 * browser never downloads a 1900px file to fill a 400px column.
 */
export function Photo({
  photo,
  aspect = 'aspect-[4/3]',
  sizes,
  className = '',
  preload = false,
}: {
  photo: PhotoData
  aspect?: string
  /** Required whenever the rendered width is not the full viewport. */
  sizes: string
  className?: string
  preload?: boolean
}) {
  return (
    <div className={cn('relative overflow-hidden rounded-lg bg-surface', aspect, className)}>
      <NextImage
        src={photo.src}
        alt={photo.alt}
        fill
        sizes={sizes}
        preload={preload}
        className="object-cover"
      />
    </div>
  )
}

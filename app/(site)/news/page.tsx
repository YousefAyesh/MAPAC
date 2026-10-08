import type { Metadata } from 'next'
import Link from 'next/link'
import { Photo } from '@/components/ui/Photo'
import { Section } from '@/components/ui/Section'
import { photo } from '@/data/photos'
import { site } from '@/data/site'
import { content } from '@/lib/content'
import { formatDate } from '@/lib/formatDate'

export const metadata: Metadata = {
  title: 'News & Press Releases',
  description: 'Statements and press releases from the Muslim American Public Affairs Council.',
}

export default async function NewsPage() {
  const posts = await content.getNews()

  return (
    <Section aria-labelledby="news-heading">
      <h1 id="news-heading" className="text-3xl">
        News &amp; press releases
      </h1>
      <Photo
        photo={photo.forum_2018_hall}
        aspect="aspect-[3/1]"
        sizes="(max-width: 1024px) 100vw, 64rem"
        className="mt-8"
      />

      {posts.length === 0 ? (
        <div className="mt-8 max-w-2xl rounded-lg border border-border-subtle bg-surface p-8">
          <p className="leading-relaxed">
            MAPAC statements and press releases will be published here. To be notified when we
            publish,{' '}
            <Link href="/get-involved" className="font-medium text-crimson-deep underline">
              join our contact list
            </Link>
            , or reach us at{' '}
            <a href={`mailto:${site.email}`} className="font-medium text-crimson-deep underline">
              {site.email}
            </a>
            .
          </p>
        </div>
      ) : (
        <ul className="mt-10 divide-y divide-border-subtle border-t border-border-subtle">
          {posts.map((post) => (
            <li key={post.slug} className="py-6">
              <p className="text-sm text-body">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
              </p>
              <h2 className="mt-1 text-xl">
                <Link href={`/news/${post.slug}`} className="hover:text-crimson-deep hover:underline">
                  {post.title}
                </Link>
              </h2>
              {post.summary && <p className="mt-2 max-w-2xl leading-relaxed">{post.summary}</p>}
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}

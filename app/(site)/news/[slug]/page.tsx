import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { Prose } from '@/components/ui/Prose'
import { Section } from '@/components/ui/Section'
import { content } from '@/lib/content'
import { formatDate } from '@/lib/formatDate'

type Params = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const posts = await content.getNews()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const post = await content.getNewsBySlug(slug)
  if (!post) return { title: 'Not found' }
  return { title: post.title, description: post.summary }
}

export default async function NewsPostPage({ params }: Params) {
  const { slug } = await params
  const post = await content.getNewsBySlug(slug)
  if (!post) notFound()

  return (
    <Section>
      <p className="text-sm text-body">
        <Link href="/news" className="font-medium text-crimson-deep underline">
          News &amp; press releases
        </Link>
      </p>
      <h1 className="mt-4 max-w-3xl text-3xl">{post.title}</h1>
      <p className="mt-3 text-sm text-body">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
      </p>
      <Prose className="mt-8">{post.body ? <MDXRemote source={post.body} /> : null}</Prose>
    </Section>
  )
}

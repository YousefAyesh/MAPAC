import type { MetadataRoute } from 'next'
import { content } from '@/lib/content'
import { siteUrl } from '@/lib/site-url'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()
  const routes = [
    '',
    '/about',
    '/elections',
    '/get-involved',
    '/news',
    '/donate',
    '/contact',
    '/privacy-policy',
  ]

  const posts = await content.getNews()

  return [
    ...routes.map((route) => ({
      url: `${base}${route}`,
      lastModified: new Date(),
    })),
    ...posts.map((post) => ({
      url: `${base}/news/${post.slug}`,
      lastModified: new Date(post.date),
    })),
  ]
}

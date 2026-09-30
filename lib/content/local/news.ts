import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import type { NewsItem } from '../types'

const NEWS_DIR = path.join(process.cwd(), 'content', 'news')

/** YAML parses an unquoted date into a Date; normalise both forms to YYYY-MM-DD. */
function toIsoDate(value: unknown): string | null {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  if (typeof value === 'string' && value.trim()) return value.trim().slice(0, 10)
  return null
}

export function parseNewsFile(filename: string, raw: string): NewsItem {
  const { data, content: body } = matter(raw)
  const slug = filename.replace(/\.mdx?$/, '')

  if (typeof data.title !== 'string' || !data.title.trim()) {
    throw new Error(`content/news/${filename}: missing required frontmatter "title"`)
  }
  const date = toIsoDate(data.date)
  if (!date) {
    throw new Error(`content/news/${filename}: missing or invalid frontmatter "date"`)
  }

  return {
    slug,
    title: data.title.trim(),
    date,
    summary: typeof data.summary === 'string' ? data.summary.trim() : '',
    body,
  }
}

/** Returns [] when the directory is absent or holds no posts, rather than throwing. */
async function readAll(): Promise<NewsItem[]> {
  let filenames: string[]
  try {
    filenames = await readdir(NEWS_DIR)
  } catch {
    return []
  }

  const posts = await Promise.all(
    filenames
      .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
      .map(async (f) => parseNewsFile(f, await readFile(path.join(NEWS_DIR, f), 'utf8'))),
  )

  return posts.sort((a, b) => b.date.localeCompare(a.date))
}

/** Newest first, bodies stripped for the index. */
export async function getNews(): Promise<NewsItem[]> {
  const posts = await readAll()
  return posts.map(({ slug, title, date, summary }) => ({ slug, title, date, summary }))
}

export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  const posts = await readAll()
  return posts.find((p) => p.slug === slug) ?? null
}

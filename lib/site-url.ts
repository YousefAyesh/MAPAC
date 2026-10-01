/**
 * The site's public base URL, used for metadata, sitemap, robots, and Stripe redirect
 * URLs. Lives in its own module rather than in lib/stripe.ts so that sitemap.ts and
 * robots.ts don't pull the Stripe SDK in just to read an environment variable.
 */
export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
}

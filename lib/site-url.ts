/**
 * The site's public base URL, used for metadata, sitemap, robots, and Stripe redirect
 * URLs. Lives in its own module rather than in lib/stripe.ts so that sitemap.ts and
 * robots.ts don't pull the Stripe SDK in just to read an environment variable.
 *
 * In production this throws if NEXT_PUBLIC_SITE_URL is unset. It is evaluated while
 * `next build` prerenders the layout, sitemap and robots, so a missing variable fails
 * the build rather than silently shipping localhost URLs to search engines.
 */
export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL
  if (configured) return configured

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'NEXT_PUBLIC_SITE_URL is not set. Production builds need the public site URL ' +
        '(e.g. https://mapacnc.com) so sitemap.xml, robots.txt, metadata and Stripe ' +
        'redirects do not point at localhost.',
    )
  }
  return 'http://localhost:3000'
}

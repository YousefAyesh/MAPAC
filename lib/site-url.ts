/**
 * The site's public base URL, used for metadata, sitemap, robots, and Stripe redirect
 * URLs. Lives in its own module rather than in lib/stripe.ts so that sitemap.ts and
 * robots.ts don't pull the Stripe SDK in just to read an environment variable.
 *
 * Resolution order, most specific first:
 *
 *  1. NEXT_PUBLIC_SITE_URL   - set this to the real custom domain. It always wins, so a
 *                              production deploy points at mapacnc.com rather than at
 *                              whatever hostname the host happened to assign.
 *  2. VERCEL_PROJECT_PRODUCTION_URL - Vercel's stable production domain, injected
 *                              automatically. Lets a first deploy succeed before anyone
 *                              has configured anything.
 *  3. VERCEL_URL             - the per-deployment hostname. Correct for preview deploys,
 *                              where each build genuinely has its own URL.
 *  4. localhost              - development only.
 *
 * If none of these resolve during a production build, this throws. That is deliberate:
 * it is evaluated while `next build` prerenders the layout, sitemap and robots, so a
 * missing URL fails the build loudly instead of silently publishing localhost links to
 * search engines and sending Stripe donors to a dead redirect.
 */
export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL
  if (configured) return stripTrailingSlash(configured)

  // Vercel injects these as bare hostnames, with no protocol.
  const vercelHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL
  if (vercelHost) return `https://${stripTrailingSlash(vercelHost)}`

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'No public site URL available. Set NEXT_PUBLIC_SITE_URL (e.g. https://mapacnc.com) ' +
        'so sitemap.xml, robots.txt, metadata and Stripe redirects do not point at ' +
        'localhost. On Vercel this is normally inferred automatically; seeing this means ' +
        'neither VERCEL_PROJECT_PRODUCTION_URL nor VERCEL_URL was present either.',
    )
  }
  return 'http://localhost:3000'
}

function stripTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '')
}

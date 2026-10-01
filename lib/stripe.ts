import Stripe from 'stripe'

let client: Stripe | null = null

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set; refusing to create a Stripe client.')
  }
  if (!client) {
    client = new Stripe(key)
  }
  return client
}

// siteUrl lives in lib/site-url.ts; re-exported here only so existing Stripe callers
// keep a single import. New callers should import from '@/lib/site-url' directly.
export { siteUrl } from './site-url'

import Stripe from 'stripe'

let client: Stripe | null = null

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}

/** Monthly giving additionally needs a recurring Price created in the Stripe dashboard. */
export function isRecurringConfigured(): boolean {
  return isStripeConfigured() && Boolean(process.env.STRIPE_RECURRING_PRICE_ID)
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

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
}

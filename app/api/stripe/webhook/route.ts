import { NextResponse } from 'next/server'
import { getStripe, isStripeConfigured } from '@/lib/stripe'

export const runtime = 'nodejs'

/**
 * Event ids already handled, for idempotency. Per-instance and memory-bound, which is
 * adequate because handling here is only logging. Move to a database before adding any
 * side effect that must happen exactly once.
 */
const seen = new Set<string>()
const SEEN_LIMIT = 1000

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!isStripeConfigured() || !secret) {
    // Not an error: the site is deployable before Stripe is wired up.
    return NextResponse.json({ received: false, reason: 'not configured' }, { status: 200 })
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ message: 'Missing stripe-signature header.' }, { status: 400 })
  }

  // Must be the raw body; parsing it first would break signature verification.
  const raw = await request.text()

  let event
  try {
    event = getStripe().webhooks.constructEvent(raw, signature, secret)
  } catch (cause) {
    console.error('[stripe] webhook signature verification failed:', cause)
    return NextResponse.json({ message: 'Invalid signature.' }, { status: 400 })
  }

  if (seen.has(event.id)) {
    return NextResponse.json({ received: true, duplicate: true })
  }
  if (seen.size >= SEEN_LIMIT) seen.clear()
  seen.add(event.id)

  switch (event.type) {
    case 'checkout.session.completed':
      console.info('[stripe] donation completed:', event.id)
      break
    case 'invoice.paid':
      console.info('[stripe] recurring donation paid:', event.id)
      break
    case 'customer.subscription.deleted':
      console.info('[stripe] recurring donation cancelled:', event.id)
      break
    default:
      break
  }

  return NextResponse.json({ received: true })
}

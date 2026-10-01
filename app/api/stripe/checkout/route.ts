import { NextResponse } from 'next/server'
import { parseAmountToCents } from '@/lib/donation'
import { checkRateLimit, clientIp } from '@/lib/rate-limit'
import { getStripe, isStripeConfigured, siteUrl } from '@/lib/stripe'

export const runtime = 'nodejs'

const RATE = { limit: 10, windowMs: 60_000 }

export async function POST(request: Request) {
  const ip = clientIp(request.headers)
  const rate = checkRateLimit(`checkout:${ip}`, RATE)
  if (!rate.ok) {
    return NextResponse.json(
      { message: 'Too many attempts. Please try again shortly.' },
      { status: 429, headers: { 'retry-after': String(rate.retryAfterSeconds) } },
    )
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      { message: 'Online donations are not available right now. Please contact MAPAC directly.' },
      { status: 503 },
    )
  }

  let payload: { amount?: unknown; frequency?: unknown }
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ message: 'Invalid request.' }, { status: 400 })
  }

  const frequency = payload.frequency
  if (frequency !== 'once' && frequency !== 'monthly') {
    return NextResponse.json({ message: 'Invalid donation frequency.' }, { status: 400 })
  }

  // The ONLY trusted source of the charge amount.
  const parsed = parseAmountToCents(payload.amount)
  if (!parsed.ok) {
    return NextResponse.json({ message: parsed.message }, { status: 400 })
  }

  const base = siteUrl()
  const success = `${base}/donate/thank-you?frequency=${frequency}`
  const cancel = `${base}/donate`

  try {
    const stripe = getStripe()

    const session =
      frequency === 'monthly'
        ? await stripe.checkout.sessions.create({
            mode: 'subscription',
            line_items: [
              {
                price_data: {
                  currency: 'usd',
                  unit_amount: parsed.cents,
                  recurring: { interval: 'month' },
                  product_data: { name: 'Monthly donation to MAPAC' },
                },
                quantity: 1,
              },
            ],
            success_url: success,
            cancel_url: cancel,
          })
        : await stripe.checkout.sessions.create({
            mode: 'payment',
            line_items: [
              {
                price_data: {
                  currency: 'usd',
                  unit_amount: parsed.cents,
                  product_data: { name: 'Donation to MAPAC' },
                },
                quantity: 1,
              },
            ],
            success_url: success,
            cancel_url: cancel,
          })

    if (!session.url) {
      return NextResponse.json({ message: 'Could not start checkout.' }, { status: 502 })
    }

    return NextResponse.json({ url: session.url })
  } catch (cause) {
    console.error('[stripe] checkout session creation failed:', cause)
    return NextResponse.json(
      { message: 'We could not start checkout. Please try again, or contact MAPAC.' },
      { status: 502 },
    )
  }
}

import { NextResponse } from 'next/server'
import { sendNotification } from '@/lib/email'
import { checkRateLimit, clientIp } from '@/lib/rate-limit'
import { fieldErrors, newsletterSchema } from '@/lib/validation'

export const runtime = 'nodejs'

const RATE = { limit: 5, windowMs: 60_000 }

export async function POST(request: Request) {
  const ip = clientIp(request.headers)
  const rate = checkRateLimit(`newsletter:${ip}`, RATE)
  if (!rate.ok) {
    return NextResponse.json(
      { ok: false, message: 'Too many submissions. Please try again shortly.' },
      { status: 429, headers: { 'retry-after': String(rate.retryAfterSeconds) } },
    )
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid request.' }, { status: 400 })
  }

  const parsed = newsletterSchema.safeParse(payload)
  if (!parsed.success) {
    const errors = fieldErrors(parsed.error)
    // A filled honeypot is a bot. Return success and do nothing.
    if (errors.botField) {
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ ok: false, errors }, { status: 400 })
  }

  const { name, email } = parsed.data
  const result = await sendNotification({
    subject: `Newsletter signup: ${name}`,
    text: `A new newsletter signup from the MAPAC website.\n\nName: ${name}\nEmail: ${email}\n`,
    replyTo: email,
  })

  if (!result.sent) {
    console.warn('[newsletter] signup not delivered:', result.reason, { email })
    return NextResponse.json(
      {
        ok: false,
        message:
          'We could not record your signup automatically. Please email mail@mapacnc.com and we will add you.',
      },
      { status: 503 },
    )
  }

  return NextResponse.json({ ok: true })
}

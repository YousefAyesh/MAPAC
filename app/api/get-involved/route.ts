import { NextResponse } from 'next/server'
import { sendNotification } from '@/lib/email'
import { checkRateLimit, clientIp } from '@/lib/rate-limit'
import { fieldErrors, getInvolvedSchema } from '@/lib/validation'

export const runtime = 'nodejs'

const RATE = { limit: 5, windowMs: 60_000 }

const INTEREST_LABELS: Record<string, string> = {
  membership: 'Becoming a member',
  volunteer: 'Volunteering',
  newsletter: 'Joining the contact list',
  other: 'Something else',
}

export async function POST(request: Request) {
  const ip = clientIp(request.headers)
  const rate = checkRateLimit(`get-involved:${ip}`, RATE)
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

  const parsed = getInvolvedSchema.safeParse(payload)
  if (!parsed.success) {
    const errors = fieldErrors(parsed.error)
    if (errors.botField) {
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ ok: false, errors }, { status: 400 })
  }

  const { name, email, phone, interest, message } = parsed.data
  const lines = [
    'A new Get Involved submission from the MAPAC website.',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || '(not given)'}`,
    `Interest: ${INTEREST_LABELS[interest] ?? interest}`,
    '',
    'Message:',
    message || '(none)',
    '',
  ]

  const result = await sendNotification({
    subject: `Get Involved: ${name} — ${INTEREST_LABELS[interest] ?? interest}`,
    text: lines.join('\n'),
    replyTo: email,
  })

  if (!result.sent) {
    console.warn('[get-involved] submission not delivered:', result.reason, { email })
    return NextResponse.json(
      {
        ok: false,
        message:
          'We could not send your message automatically. Please email mail@mapacnc.com or call (984) 254-7441.',
      },
      { status: 503 },
    )
  }

  return NextResponse.json({ ok: true })
}

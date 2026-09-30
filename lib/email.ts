import { Resend } from 'resend'

/** Resend's shared sender, usable before MAPAC verifies its own domain. */
const FROM = 'MAPAC Website <onboarding@resend.dev>'

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY)
}

export function notificationRecipient(): string {
  return process.env.CONTACT_TO_EMAIL ?? 'mail@mapacnc.com'
}

export type SendResult = {
  sent: boolean
  reason?: string
}

/**
 * Sends a plain-text notification to MAPAC. Never throws: a form submission must not
 * return a 500 because an email provider is unconfigured or temporarily down.
 */
export async function sendNotification({
  subject,
  text,
  replyTo,
}: {
  subject: string
  text: string
  replyTo?: string
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return { sent: false, reason: 'Email is not configured (RESEND_API_KEY is unset).' }
  }

  try {
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from: FROM,
      to: notificationRecipient(),
      subject,
      text,
      ...(replyTo ? { replyTo } : {}),
    })

    if (error) {
      console.error('[email] Resend returned an error:', error)
      return { sent: false, reason: 'The email provider rejected the message.' }
    }

    return { sent: true }
  } catch (cause) {
    console.error('[email] Unexpected failure sending notification:', cause)
    return { sent: false, reason: 'The email provider could not be reached.' }
  }
}

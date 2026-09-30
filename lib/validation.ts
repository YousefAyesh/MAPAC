import { z } from 'zod'

/**
 * Hidden field. Real users never see it, so a non-empty value means a bot.
 * Optional because a browser may omit an empty input entirely.
 */
const honeypot = z
  .string()
  .max(0, 'This submission looks automated.')
  .optional()
  .or(z.literal(''))

const name = z.string().trim().min(1, 'Please enter your name.').max(200, 'That name is too long.')

const email = z
  .string()
  .trim()
  .min(1, 'Please enter your email address.')
  .max(320, 'That email address is too long.')
  .email('Please enter a valid email address.')

export const INTERESTS = ['membership', 'volunteer', 'newsletter', 'other'] as const

export const newsletterSchema = z.object({
  name,
  email,
  botField: honeypot,
})

export const getInvolvedSchema = z.object({
  name,
  email,
  phone: z.string().trim().max(40, 'That phone number is too long.').optional(),
  interest: z.enum(INTERESTS, { message: 'Please choose how you would like to get involved.' }),
  message: z.string().trim().max(5000, 'Please keep your message under 5000 characters.').optional(),
  botField: honeypot,
})

export type NewsletterInput = z.infer<typeof newsletterSchema>
export type GetInvolvedInput = z.infer<typeof getInvolvedSchema>

/** Flattens a zod error into `{ fieldName: firstMessage }` for rendering under inputs. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form')
    if (!out[key]) out[key] = issue.message
  }
  return out
}

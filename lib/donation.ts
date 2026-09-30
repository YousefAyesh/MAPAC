/** Preset buttons, in dollars. */
export const PRESET_AMOUNTS = [25, 50, 100, 250, 500] as const

/** $1.00 minimum — below this, Stripe's fee exceeds the donation. */
export const MIN_CENTS = 100

/** $25,000 ceiling. A larger gift should be arranged directly with MAPAC. */
export const MAX_CENTS = 2_500_000

export type ParseResult = { ok: true; cents: number } | { ok: false; message: string }

/**
 * Converts an untrusted dollar amount into cents, or refuses it.
 *
 * This is the server's only source of truth for the charge amount. Never charge a value
 * that came from the client without passing it through here first.
 */
export function parseAmountToCents(input: unknown): ParseResult {
  let dollars: number

  if (typeof input === 'number') {
    dollars = input
  } else if (typeof input === 'string') {
    const cleaned = input.replace(/[$,\s]/g, '')
    if (!/^\d*\.?\d+$/.test(cleaned)) {
      return { ok: false, message: 'Please enter a donation amount in dollars.' }
    }
    dollars = Number(cleaned)
  } else {
    return { ok: false, message: 'Please enter a donation amount in dollars.' }
  }

  if (!Number.isFinite(dollars)) {
    return { ok: false, message: 'Please enter a donation amount in dollars.' }
  }

  const cents = Math.round(dollars * 100)

  if (cents < MIN_CENTS) {
    return { ok: false, message: `The minimum donation is $${(MIN_CENTS / 100).toFixed(2)}.` }
  }
  if (cents > MAX_CENTS) {
    return {
      ok: false,
      message: `For gifts above $${(MAX_CENTS / 100).toLocaleString('en-US')}, please contact MAPAC directly.`,
    }
  }

  return { ok: true, cents }
}

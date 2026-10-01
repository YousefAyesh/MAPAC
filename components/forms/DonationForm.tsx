'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { PRESET_AMOUNTS } from '@/lib/donation'

type Frequency = 'once' | 'monthly'

export function DonationForm() {
  const [frequency, setFrequency] = useState<Frequency>('once')
  const [amount, setAmount] = useState<string>('100')
  const [custom, setCustom] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const usingCustom = amount === 'custom'
  const effectiveAmount = usingCustom ? custom : amount

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ amount: effectiveAmount, frequency }),
      })
      const body = await res.json()

      if (res.ok && body.url) {
        window.location.href = body.url
        return
      }

      setSubmitting(false)
      setError(body.message ?? 'We could not start checkout. Please try again.')
    } catch {
      setSubmitting(false)
      setError('We could not reach the server. Please check your connection and try again.')
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <fieldset>
        <legend className="text-sm font-medium text-navy">How often</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {(['once', 'monthly'] as const).map((value) => {
            return (
              <label
                key={value}
                className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded border px-4 text-sm font-medium ${
                  frequency === value
                    ? 'border-crimson bg-crimson text-white'
                    : 'border-border-subtle bg-white text-navy'
                }`}
              >
                <input
                  type="radio"
                  name="frequency"
                  value={value}
                  checked={frequency === value}
                  onChange={() => setFrequency(value)}
                  className="sr-only"
                />
                {value === 'once' ? 'One time' : 'Monthly'}
              </label>
            )
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium text-navy">Amount</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {PRESET_AMOUNTS.map((preset) => (
            <label
              key={preset}
              className={`inline-flex min-h-11 cursor-pointer items-center rounded border px-4 text-sm font-medium ${
                amount === String(preset)
                  ? 'border-crimson bg-crimson text-white'
                  : 'border-border-subtle bg-white text-navy'
              }`}
            >
              <input
                type="radio"
                name="amount"
                value={preset}
                checked={amount === String(preset)}
                onChange={() => setAmount(String(preset))}
                className="sr-only"
              />
              ${preset}
            </label>
          ))}
          <label
            className={`inline-flex min-h-11 cursor-pointer items-center rounded border px-4 text-sm font-medium ${
              usingCustom
                ? 'border-crimson bg-crimson text-white'
                : 'border-border-subtle bg-white text-navy'
            }`}
          >
            <input
              type="radio"
              name="amount"
              value="custom"
              checked={usingCustom}
              onChange={() => setAmount('custom')}
              className="sr-only"
            />
            Other
          </label>
        </div>
      </fieldset>

      {usingCustom && (
        <Field id="custom-amount" label="Custom amount (USD)" required>
          {(props) => (
            <input
              {...props}
              type="text"
              inputMode="decimal"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="75"
              className="block min-h-11 w-40 rounded border border-border-subtle bg-white px-3 text-base text-navy"
            />
          )}
        </Field>
      )}

      {error && (
        <p role="alert" className="text-sm font-medium text-crimson-deep">
          {error}
        </p>
      )}

      <Button type="submit" disabled={submitting}>
        {submitting ? 'Redirecting…' : 'Continue to secure checkout'}
      </Button>

      <p className="text-xs leading-relaxed text-body">
        Payments are processed by Stripe. Your card details are entered on Stripe&rsquo;s secure
        pages and are never stored by MAPAC.
      </p>
    </form>
  )
}

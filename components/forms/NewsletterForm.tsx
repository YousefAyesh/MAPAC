'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { site } from '@/data/site'

const INPUT =
  'block w-full min-h-11 rounded border border-border-subtle bg-white px-3 text-base text-navy placeholder:text-body/50'

type Status = 'idle' | 'submitting' | 'done'

export function NewsletterForm({ configured }: { configured: boolean }) {
  const [status, setStatus] = useState<Status>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formMessage, setFormMessage] = useState<string | null>(null)

  if (!configured) {
    return (
      <p className="leading-relaxed">
        To join our contact list, email us at{' '}
        <a
          href={`mailto:${site.email}?subject=Join%20the%20MAPAC%20contact%20list`}
          aria-label={`Email ${site.email}`}
          className="font-medium text-crimson-deep underline"
        >
          {site.email}
        </a>{' '}
        and we will add you.
      </p>
    )
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('submitting')
    setErrors({})
    setFormMessage(null)

    const data = Object.fromEntries(new FormData(event.currentTarget))

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data),
      })
      const body = await res.json()

      if (res.ok && body.ok) {
        setStatus('done')
        return
      }

      setStatus('idle')
      setErrors(body.errors ?? {})
      setFormMessage(body.message ?? 'Something went wrong. Please try again.')
    } catch {
      setStatus('idle')
      setFormMessage('We could not reach the server. Please check your connection and try again.')
    }
  }

  if (status === 'done') {
    return (
      <p role="status" className="rounded border border-border-subtle bg-surface p-5 leading-relaxed">
        Thank you — you&rsquo;re on the list. We&rsquo;ll be in touch.
      </p>
    )
  }

  return (
    <form data-testid="newsletter-form" onSubmit={onSubmit} noValidate className="space-y-4">
      <Field id="newsletter-name" label="Name" required error={errors.name}>
        {(props) => <input {...props} name="name" type="text" autoComplete="name" className={INPUT} />}
      </Field>

      <Field id="newsletter-email" label="Email address" required error={errors.email}>
        {(props) => <input {...props} name="email" type="email" autoComplete="email" className={INPUT} />}
      </Field>

      {/* Honeypot: hidden from users, so anything here is a bot. */}
      <div hidden aria-hidden="true">
        <label htmlFor="newsletter-bot">Leave this field empty</label>
        <input id="newsletter-bot" name="botField" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {formMessage && (
        <p role="alert" className="text-sm font-medium text-crimson-deep">
          {formMessage}
        </p>
      )}

      <Button type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Signing up…' : 'Sign up'}
      </Button>
    </form>
  )
}

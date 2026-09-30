'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { site } from '@/data/site'

const INPUT =
  'block w-full min-h-11 rounded border border-border-subtle bg-white px-3 text-base text-navy placeholder:text-body/50'

const OPTIONS = [
  { value: 'membership', label: 'Becoming a member' },
  { value: 'volunteer', label: 'Volunteering' },
  { value: 'newsletter', label: 'Joining the contact list' },
  { value: 'other', label: 'Something else' },
]

type Status = 'idle' | 'submitting' | 'done'

export function GetInvolvedForm({ configured }: { configured: boolean }) {
  const [status, setStatus] = useState<Status>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formMessage, setFormMessage] = useState<string | null>(null)

  if (!configured) {
    return (
      <div className="space-y-3 leading-relaxed">
        <p>To get involved, reach us directly:</p>
        <p>
          <a
            href={`mailto:${site.email}`}
            aria-label={`Email ${site.email}`}
            className="font-medium text-crimson-deep underline"
          >
            {site.email}
          </a>
          <br />
          <a
            href={site.phoneHref}
            aria-label={`Call ${site.phone}`}
            className="font-medium text-crimson-deep underline"
          >
            {site.phone}
          </a>
        </p>
      </div>
    )
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('submitting')
    setErrors({})
    setFormMessage(null)

    const data = Object.fromEntries(new FormData(event.currentTarget))

    try {
      const res = await fetch('/api/get-involved', {
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
        Thank you for reaching out. A member of MAPAC will get back to you.
      </p>
    )
  }

  return (
    <form data-testid="get-involved-form" onSubmit={onSubmit} noValidate className="space-y-4">
      <Field id="gi-name" label="Name" required error={errors.name}>
        {(props) => <input {...props} name="name" type="text" autoComplete="name" className={INPUT} />}
      </Field>

      <Field id="gi-email" label="Email address" required error={errors.email}>
        {(props) => <input {...props} name="email" type="email" autoComplete="email" className={INPUT} />}
      </Field>

      <Field id="gi-phone" label="Phone number" hint="Optional" error={errors.phone}>
        {(props) => <input {...props} name="phone" type="tel" autoComplete="tel" className={INPUT} />}
      </Field>

      <Field id="gi-interest" label="I'm interested in" required error={errors.interest}>
        {(props) => (
          <select {...props} name="interest" defaultValue="membership" className={INPUT}>
            {OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )}
      </Field>

      <Field id="gi-message" label="Message" hint="Optional" error={errors.message}>
        {(props) => (
          <textarea {...props} name="message" rows={5} className={`${INPUT} py-2`} />
        )}
      </Field>

      <div hidden aria-hidden="true">
        <label htmlFor="gi-bot">Leave this field empty</label>
        <input id="gi-bot" name="botField" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {formMessage && (
        <p role="alert" className="text-sm font-medium text-crimson-deep">
          {formMessage}
        </p>
      )}

      <Button type="submit" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Sending…' : 'Send'}
      </Button>
    </form>
  )
}

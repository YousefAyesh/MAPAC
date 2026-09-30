import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { NewsletterForm } from './NewsletterForm'

describe('NewsletterForm', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('labels both inputs so they are reachable by accessible name', () => {
    render(<NewsletterForm configured />)
    expect(screen.getByLabelText(/name/i)).toBeDefined()
    expect(screen.getByLabelText(/email/i)).toBeDefined()
  })

  it('renders a mailto fallback instead of a form when email is unconfigured', () => {
    render(<NewsletterForm configured={false} />)
    expect(screen.queryByRole('button', { name: /sign up/i })).toBeNull()
    const link = screen.getByRole('link', { name: /email/i })
    expect(link.getAttribute('href')).toMatch(/^mailto:/)
  })

  it('shows a server field error under the input', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify({ ok: false, errors: { email: 'Bad email.' } }), {
          status: 400,
          headers: { 'content-type': 'application/json' },
        }),
      ),
    )

    render(<NewsletterForm configured />)
    const form = screen.getByTestId('newsletter-form') as HTMLFormElement
    ;(screen.getByLabelText(/name/i) as HTMLInputElement).value = 'Aisha'
    ;(screen.getByLabelText(/email/i) as HTMLInputElement).value = 'nope'
    form.requestSubmit()

    await waitFor(() => {
      expect(screen.getByText('Bad email.')).toBeDefined()
    })
  })

  it('shows a success message after a successful submission', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }),
      ),
    )

    render(<NewsletterForm configured />)
    const form = screen.getByTestId('newsletter-form') as HTMLFormElement
    ;(screen.getByLabelText(/name/i) as HTMLInputElement).value = 'Aisha'
    ;(screen.getByLabelText(/email/i) as HTMLInputElement).value = 'a@example.com'
    form.requestSubmit()

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeDefined()
    })
  })
})

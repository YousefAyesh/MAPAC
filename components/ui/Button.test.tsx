import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { Button } from './Button'

// Substitute a distinguishable stand-in for next/link so tests can tell "rendered as
// Link" apart from "rendered as a plain <a>" — both produce an <a> in the DOM, so the
// tag alone can't distinguish the two branches.
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: ComponentProps<'a'>) => (
    <a href={href} data-testid="next-link" {...rest}>
      {children}
    </a>
  ),
}))

describe('Button', () => {
  it('renders a button element by default', () => {
    render(<Button>Donate</Button>)
    expect(screen.getByRole('button', { name: 'Donate' })).toBeDefined()
  })

  it('renders an anchor when href is given', () => {
    render(<Button href="/donate">Donate</Button>)
    const link = screen.getByRole('link', { name: 'Donate' })
    expect(link.getAttribute('href')).toBe('/donate')
  })

  it('applies the primary variant by default', () => {
    render(<Button>Go</Button>)
    expect(screen.getByRole('button').className).toContain('bg-crimson')
  })

  it('meets the 44px minimum touch target', () => {
    render(<Button>Go</Button>)
    expect(screen.getByRole('button').className).toContain('min-h-11')
  })

  describe('href branching', () => {
    it('renders a plain external anchor for a protocol-relative href', () => {
      render(<Button href="//example.com">Go</Button>)
      const link = screen.getByRole('link', { name: 'Go' })
      expect(link.tagName).toBe('A')
      expect(link.dataset.testid).toBeUndefined()
    })

    it('renders a plain external anchor for a mailto href', () => {
      render(<Button href="mailto:x@y.com">Email</Button>)
      const link = screen.getByRole('link', { name: 'Email' })
      expect(link.dataset.testid).toBeUndefined()
    })

    it('renders a Link for a hash fragment', () => {
      render(<Button href="#section">Go</Button>)
      const link = screen.getByRole('link', { name: 'Go' })
      expect(link.dataset.testid).toBe('next-link')
    })

    it('renders a Link for a query-only href', () => {
      render(<Button href="?x=1">Go</Button>)
      const link = screen.getByRole('link', { name: 'Go' })
      expect(link.dataset.testid).toBe('next-link')
    })

    it('renders a Link for an internal path', () => {
      render(<Button href="/about">Go</Button>)
      const link = screen.getByRole('link', { name: 'Go' })
      expect(link.dataset.testid).toBe('next-link')
    })

    it('renders a button element when no href is given', () => {
      render(<Button>Go</Button>)
      expect(screen.getByRole('button', { name: 'Go' })).toBeDefined()
    })
  })
})

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from './Button'

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
})

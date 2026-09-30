import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Disclosure } from './Disclosure'

describe('Disclosure', () => {
  it('renders a real button, not a div', () => {
    render(<Disclosure summary="Criterion">Body</Disclosure>)
    expect(screen.getByRole('button', { name: /Criterion/ }).tagName).toBe('BUTTON')
  })

  it('is collapsed by default and reports that via aria-expanded', () => {
    render(<Disclosure summary="Criterion">Body</Disclosure>)
    expect(screen.getByRole('button').getAttribute('aria-expanded')).toBe('false')
  })

  it('points aria-controls at the panel it controls', () => {
    render(<Disclosure summary="Criterion">Body</Disclosure>)
    const controls = screen.getByRole('button').getAttribute('aria-controls')
    expect(controls).toBeTruthy()
    expect(document.getElementById(controls!)).not.toBeNull()
  })
})

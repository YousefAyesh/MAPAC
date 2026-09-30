import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { render, screen } from '@testing-library/react'
import { SkipLink } from './SkipLink'

/**
 * The skip link's href and the root layout's <main id> are two hand-typed strings in
 * separate files. Nothing else would catch a typo in either: tsc, lint and every other
 * test stay green while the skip link silently stops working — its one job.
 */
describe('SkipLink', () => {
  it('targets a fragment', () => {
    render(<SkipLink />)
    const href = screen.getByRole('link', { name: 'Skip to content' }).getAttribute('href')
    expect(href).toMatch(/^#/)
  })

  it('targets an id that the root layout actually renders', () => {
    render(<SkipLink />)
    const href = screen.getByRole('link', { name: 'Skip to content' }).getAttribute('href')!
    const targetId = href.slice(1)

    const layout = readFileSync(path.join(process.cwd(), 'app', 'layout.tsx'), 'utf8')
    expect(layout, `app/layout.tsx must render an element with id="${targetId}"`).toContain(
      `id="${targetId}"`,
    )
    expect(layout).toMatch(new RegExp(`<main[^>]*id="${targetId}"`))
  })
})

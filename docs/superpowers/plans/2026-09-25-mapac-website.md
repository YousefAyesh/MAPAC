# MAPAC Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build MAPAC's website as a Next.js 15 site carrying over all evergreen content from mapacnc.com, excluding every outdated election artifact.

**Architecture:** Static-rendered App Router pages read all content through a single swappable adapter (`lib/content`) so Sanity can replace in-repo data later without touching components. Four Node-runtime API routes handle forms and Stripe Checkout; each integration degrades to a working fallback when its env var is absent, so the site is deployable before any credential exists.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS v4, `next/font` (Source Serif 4 + Inter), Vitest, Playwright + axe-core, Stripe Checkout, Resend.

**Spec:** `docs/superpowers/specs/2026-09-25-mapac-website-design.md`

**Phases:** Each phase ends with the site building and deployable.
- Phase 0 (Tasks 1–3): scaffold, tokens, UI primitives
- Phase 1 (Tasks 4–9): content layer
- Phase 2 (Tasks 10–12): layout shell
- Phase 3 (Tasks 13–19): pages
- Phase 4 (Tasks 20–24): forms
- Phase 5 (Tasks 25–27): donations
- Phase 6 (Tasks 28–30): e2e, accessibility, launch assets

---

## Phase 0 — Foundation

### Task 1: Scaffold the project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `vitest.config.ts`, `.env.example`, `.gitignore`
- Create: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`

- [ ] **Step 1: Create the Next.js app in place**

The project directory already contains `docs/` and a git repo, so scaffold into a temp dir and move the files in (create-next-app refuses a non-empty directory).

```bash
cd /Users/yousef/Developer/Mapac
npx --yes create-next-app@latest .mapac-scaffold \
  --typescript --tailwind --eslint --app \
  --src-dir false --import-alias "@/*" --use-npm --no-turbopack --yes
# move everything including dotfiles, but never clobber docs/ or .git/
shopt -s dotglob
for f in .mapac-scaffold/*; do
  base=$(basename "$f")
  [ "$base" = ".git" ] && continue
  mv "$f" .
done
shopt -u dotglob
rmdir .mapac-scaffold
```

- [ ] **Step 2: Verify the scaffold builds**

Run: `npm run build`
Expected: `✓ Compiled successfully`, and a route list including `/`. If it fails, stop and fix before continuing.

- [ ] **Step 3: Add Vitest and testing dependencies**

```bash
npm install --save-dev vitest @vitejs/plugin-react vite-tsconfig-paths \
  @testing-library/react @testing-library/dom jsdom zod
```

Note `zod` is a runtime dependency, not a dev one — move it:

```bash
npm install zod
```

- [ ] **Step 4: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['**/*.test.ts', '**/*.test.tsx'],
    exclude: ['node_modules', '.next', 'e2e'],
  },
})
```

- [ ] **Step 5: Add test scripts to `package.json`**

In the `"scripts"` block, add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 6: Write a smoke test to verify Vitest works**

Create `lib/smoke.test.ts`:

```ts
import { describe, it, expect } from 'vitest'

describe('test harness', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 7: Run the test**

Run: `npm test`
Expected: `1 passed`

- [ ] **Step 8: Delete the smoke test**

```bash
rm lib/smoke.test.ts
```

- [ ] **Step 9: Create `.env.example`**

```bash
# Stripe — donations. Absent: donate page shows mail-a-check fallback.
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_RECURRING_PRICE_ID=

# Resend — newsletter and volunteer forms. Absent: forms become mailto links.
RESEND_API_KEY=
CONTACT_TO_EMAIL=mail@mapacnc.com

# Public site URL, used for Stripe redirect URLs and metadata.
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- [ ] **Step 10: Confirm `.env*.local` is gitignored**

Run: `grep -n "env" .gitignore`
Expected: a line matching `.env*` (create-next-app adds it). If absent, append `.env*.local` to `.gitignore`.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js app with Vitest and env template"
```

---

### Task 2: Design tokens and fonts

**Files:**
- Modify: `app/globals.css` (replace entirely)
- Create: `lib/fonts.ts`
- Modify: `app/layout.tsx`

- [ ] **Step 1: Create `lib/fonts.ts`**

```ts
import { Inter, Source_Serif_4 } from 'next/font/google'

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-source-serif',
})
```

- [ ] **Step 2: Replace `app/globals.css` entirely**

Every colour below is from the spec's verified-contrast table. Do not invent additional colours.

```css
@import "tailwindcss";

@theme {
  /* Brand — carried from mapacnc.com, contrast-verified */
  --color-navy: #022047;
  --color-navy-800: #06305f;
  --color-navy-700: #0b4179;
  --color-crimson: #c80f15;
  --color-crimson-deep: #810003;

  /* Neutrals */
  --color-surface: #f7f8fa;
  --color-body: #475569;
  --color-border-subtle: #e2e8f0;

  /* Type */
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --font-serif: var(--font-source-serif), ui-serif, Georgia, serif;

  /* Modular scale, ratio 1.25 */
  --text-xs: 0.8rem;
  --text-sm: 0.9rem;
  --text-base: 1rem;
  --text-lg: 1.25rem;
  --text-xl: 1.563rem;
  --text-2xl: 1.953rem;
  --text-3xl: 2.441rem;
  --text-4xl: 3.052rem;
}

:root {
  color-scheme: light;
}

body {
  background: #ffffff;
  color: var(--color-body);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, h4 {
  font-family: var(--font-serif);
  color: var(--color-navy);
  letter-spacing: -0.01em;
}

/* Focus rings are never removed without replacement — spec accessibility requirement */
:focus-visible {
  outline: 3px solid var(--color-crimson);
  outline-offset: 2px;
  border-radius: 2px;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 3: Wire fonts into `app/layout.tsx`**

Replace the file with:

```tsx
import type { Metadata } from 'next'
import { inter, sourceSerif } from '@/lib/fonts'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Muslim American Public Affairs Council',
    template: '%s | MAPAC',
  },
  description:
    'MAPAC lobbies at all levels of government on behalf of our growing American Muslim community.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable}`}>
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 4: Verify the build succeeds with tokens and fonts**

Run: `npm run build`
Expected: `✓ Compiled successfully`

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add design tokens and self-hosted fonts"
```

---

### Task 3: UI primitives

**Files:**
- Create: `components/ui/Button.tsx`, `components/ui/Section.tsx`, `components/ui/Card.tsx`, `components/ui/Prose.tsx`
- Test: `components/ui/Button.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `components/ui/Button.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- Button`
Expected: FAIL — `Failed to resolve import "./Button"`

- [ ] **Step 3: Implement `components/ui/Button.tsx`**

```tsx
import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-crimson text-white hover:bg-crimson-deep',
  secondary: 'bg-navy text-white hover:bg-navy-800',
  ghost: 'bg-transparent text-navy border border-border-subtle hover:bg-surface',
}

// min-h-11 is 44px — the spec's minimum touch target.
const BASE =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded px-5 text-sm font-semibold transition-colors'

type Props = {
  children: ReactNode
  variant?: Variant
  href?: string
  className?: string
} & Omit<ComponentProps<'button'>, 'className' | 'children'>

export function Button({
  children,
  variant = 'primary',
  href,
  className = '',
  ...rest
}: Props) {
  const classes = `${BASE} ${VARIANTS[variant]} ${className}`.trim()

  if (href) {
    const external = href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')
    if (external) {
      return (
        <a href={href} className={classes}>
          {children}
        </a>
      )
    }
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- Button`
Expected: `4 passed`

- [ ] **Step 5: Create `components/ui/Section.tsx`**

```tsx
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  /** Tints the section background with the surface token, for alternating bands. */
  tinted?: boolean
  className?: string
  id?: string
  'aria-labelledby'?: string
}

export function Section({ children, tinted = false, className = '', id, ...rest }: Props) {
  return (
    <section
      id={id}
      className={`${tinted ? 'bg-surface' : 'bg-white'} px-5 py-16 sm:px-8 sm:py-20 ${className}`.trim()}
      {...rest}
    >
      <div className="mx-auto w-full max-w-5xl">{children}</div>
    </section>
  )
}
```

- [ ] **Step 6: Create `components/ui/Card.tsx`**

```tsx
import type { ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-lg border border-border-subtle bg-white p-6 ${className}`.trim()}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 7: Create `components/ui/Prose.tsx`**

```tsx
import type { ReactNode } from 'react'

/** Readable long-form text column. Links use crimson-deep (AAA) not crimson (AA). */
export function Prose({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`max-w-prose space-y-4 text-base leading-relaxed [&_a]:font-medium [&_a]:text-crimson-deep [&_a]:underline [&_h2]:mt-10 [&_h2]:text-2xl [&_h3]:mt-8 [&_h3]:text-xl [&_li]:leading-relaxed [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 ${className}`.trim()}
    >
      {children}
    </div>
  )
}
```

- [ ] **Step 8: Run the full test suite and build**

Run: `npm test && npm run build`
Expected: all tests pass, build compiles

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add Button, Section, Card and Prose primitives"
```

---
## Phase 1 — Content layer

> **Why this phase exists:** components must never import from `data/` or read files
> directly. Every read goes through `lib/content`. That is what makes a later Sanity
> migration a new folder plus one changed export, instead of a rewrite. Reviewers:
> reject any later task that imports `@/data/...` inside `components/` or `app/`.

### Task 4: Content types and source interface

**Files:**
- Create: `lib/content/types.ts`, `lib/content/source.ts`

- [ ] **Step 1: Create `lib/content/types.ts`**

These are the only content shapes in the system. Later tasks must use these exact
property names.

```ts
export type Goal = {
  id: string
  text: string
}

export type Pillar = {
  id: string
  title: string
  body: string
}

/** A person in either the Board of Trustees or the Executive Committee. */
export type Person = {
  id: string
  name: string
  /** Board office, e.g. "Chair". Undefined for a trustee with no office. */
  boardRole?: string
  /** Executive Committee office, e.g. "President". Undefined if not on the EC. */
  executiveRole?: string
}

export type GovernanceBody = {
  id: string
  name: string
  description: string
}

export type Principle = {
  id: string
  text: string
}

export type Criterion = {
  id: string
  title: string
  description: string
}

export type RubricRow = {
  criterion: string
  weight: number
}

export type Rubric = {
  id: string
  /** Office level, e.g. "State Legislature". */
  office: string
  rows: RubricRow[]
}

export type Endorsement = {
  id: string
  candidate: string
  office: string
  /** Election cycle label, e.g. "November 2026 General". */
  cycle: string
  /** ISO date the endorsement was issued. */
  date: string
  statementUrl?: string
}

export type NewsItem = {
  slug: string
  title: string
  /** ISO date. */
  date: string
  summary: string
  /** Rendered MDX body. Absent on index listings. */
  body?: string
}
```

- [ ] **Step 2: Create `lib/content/source.ts`**

```ts
import type {
  Criterion,
  Endorsement,
  Goal,
  GovernanceBody,
  NewsItem,
  Person,
  Pillar,
  Principle,
  Rubric,
} from './types'

/**
 * The single contract every content backend implements. The local backend reads
 * `data/` and `content/`. A future Sanity backend implements this same interface,
 * and `lib/content/index.ts` switches which one is exported.
 */
export type ContentSource = {
  getGoals(): Promise<Goal[]>
  getPillars(): Promise<Pillar[]>
  getGovernanceBodies(): Promise<GovernanceBody[]>
  /** Everyone on the Board of Trustees, officers first. */
  getTrustees(): Promise<Person[]>
  /** Only people holding an Executive Committee office. */
  getExecutiveCommittee(): Promise<Person[]>
  /** Former trustees MAPAC acknowledges on the About page. */
  getOutgoingTrustees(): Promise<Person[]>
  /** The year the published roster describes, e.g. 2025. */
  getLeadershipYear(): Promise<number>
  getPrinciples(): Promise<Principle[]>
  getCriteria(): Promise<Criterion[]>
  getRubrics(): Promise<Rubric[]>
  /** Empty array means the Elections page renders no endorsements section. */
  getEndorsements(): Promise<Endorsement[]>
  /** Newest first. Bodies omitted. */
  getNews(): Promise<NewsItem[]>
  /** Null when no post has that slug. */
  getNewsBySlug(slug: string): Promise<NewsItem | null>
}
```

- [ ] **Step 2b: Verify it typechecks**

Run: `npx tsc --noEmit`
Expected: no output (success)

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: define content types and ContentSource interface"
```

---

### Task 5: Site constants, goals and pillars

All copy in this task is verbatim from mapacnc.com. Do not paraphrase it. The About
page lists **eight** goals; the home page shows only the first six. Both pages read the
same collection and Home slices it.

**Files:**
- Create: `data/site.ts`, `data/goals.ts`, `data/pillars.ts`
- Create: `lib/content/local/index.ts`, `lib/content/index.ts`
- Test: `lib/content/local/content.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/content/local/content.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { content } from '@/lib/content'

describe('goals', () => {
  it('returns all eight goals from the About page', async () => {
    const goals = await content.getGoals()
    expect(goals).toHaveLength(8)
  })

  it('preserves the lobbying goal verbatim', async () => {
    const goals = await content.getGoals()
    expect(goals.map((g) => g.text)).toContain(
      'Lobby Politicians at all levels within the US political system.',
    )
  })

  it('includes the two goals the old home page omitted', async () => {
    const texts = (await content.getGoals()).map((g) => g.text)
    expect(texts).toContain(
      'Strive for assurance of basic human rights of all Americans and of all Muslims.',
    )
    expect(texts).toContain(
      'Strive to eliminate in the American society any vestiges of discrimination on the basis of race, gender, religion or ethnicity.',
    )
  })

  it('orders the six home-page goals first so Home can slice them', async () => {
    const goals = await content.getGoals()
    expect(goals[0].id).toBe('participate')
    expect(goals[5].id).toBe('interfaith')
  })

  it('gives every goal a unique id', async () => {
    const goals = await content.getGoals()
    expect(new Set(goals.map((g) => g.id)).size).toBe(goals.length)
  })
})

describe('pillars', () => {
  it('returns the three pillars from the old home page in order', async () => {
    const pillars = await content.getPillars()
    expect(pillars.map((p) => p.title)).toEqual([
      'Elevating Diversity',
      'Advocating for Inclusivity',
      'Fostering Dialogue',
    ])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- content`
Expected: FAIL — cannot resolve `@/lib/content`

- [ ] **Step 3: Create `data/site.ts`**

```ts
export const site = {
  name: 'Muslim American Public Affairs Council',
  shortName: 'MAPAC',
  tagline: 'Empowering American Muslims through Advocacy and Unity',
  mission:
    'The Muslim American Public Affairs Council (MAPAC) is an organization that aims to lobby at all levels of government on behalf of our growing American Muslim community.',
  /** The fuller "What We Do" paragraph from the About page. Verbatim. */
  whatWeDo:
    'The Muslim American Public Affairs Council (MAPAC) is an organization that aims to lobby at all levels of government on behalf of our growing American Muslim community. MAPAC focuses on politics and its effect on Muslims in America. MAPAC supports our Islamic Organizations in fulfilling their purpose and responsibility for the religious affairs in our areas. MAPAC also supports all other Muslim organizations in their efforts in many areas such as peace and human rights issues.',
  address: {
    line1: 'P.O. Box 18196',
    line2: 'Raleigh, NC 27619',
    mapsUrl: 'https://maps.app.goo.gl/E4R7Q4PAjZWLStxZ6',
  },
  phone: '(984) 254-7441',
  phoneHref: 'tel:9842547441',
  email: 'mail@mapacnc.com',
  social: {
    instagram: 'https://www.instagram.com/mapacnc/',
    facebook: 'https://www.facebook.com/MuslimAmericanPublicAffairsC0UNCIL',
    youtube: 'https://www.youtube.com/channel/UCtmElPYwXVIYh3OqXhTU9vg',
  },
} as const
```

- [ ] **Step 4: Create `data/goals.ts`**

```ts
import type { Goal } from '@/lib/content/types'

/**
 * Verbatim from the About page. The first six also appeared on the old home page;
 * `HOME_GOAL_COUNT` keeps Home and About reading one collection.
 */
export const goals: Goal[] = [
  {
    id: 'participate',
    text: 'Educate and encourage American Muslims to partake in the US political process.',
  },
  { id: 'lobby', text: 'Lobby Politicians at all levels within the US political system.' },
  {
    id: 'empowerment',
    text: 'Enhance the political empowerment of American Muslims at all levels of the American political process.',
  },
  {
    id: 'educate-policymakers',
    text: 'Educate American policy makers on issues of concern to Muslims and their impact on the local, national and global Muslim community.',
  },
  { id: 'present-tradition', text: 'Present Islamic tradition, values, history and culture.' },
  {
    id: 'interfaith',
    text: 'Foster inter-religious and inter-ethnic understanding, interaction and cooperation for enhancing the common good and dignity of all human beings.',
  },
  {
    id: 'human-rights',
    text: 'Strive for assurance of basic human rights of all Americans and of all Muslims.',
  },
  {
    id: 'anti-discrimination',
    text: 'Strive to eliminate in the American society any vestiges of discrimination on the basis of race, gender, religion or ethnicity.',
  },
]

export const HOME_GOAL_COUNT = 6
```

- [ ] **Step 5: Create `data/pillars.ts`**

```ts
import type { Pillar } from '@/lib/content/types'

/** Verbatim from the old home page. */
export const pillars: Pillar[] = [
  {
    id: 'diversity',
    title: 'Elevating Diversity',
    body: 'Championing the rich diversity within the American Muslim community, MAPAC ensures that all voices are heard and represented in the national dialogue.',
  },
  {
    id: 'inclusivity',
    title: 'Advocating for Inclusivity',
    body: 'By advocating for policies that promote inclusivity and equality, MAPAC empowers Muslims from all backgrounds to participate fully in society.',
  },
  {
    id: 'dialogue',
    title: 'Fostering Dialogue',
    body: 'Through community engagement and outreach programs, MAPAC fosters dialogue and understanding among Muslims and with broader society, creating spaces for mutual respect and collaboration.',
  },
]
```

- [ ] **Step 6: Create `lib/content/local/index.ts`**

Only this task's methods are implemented. The rest throw, naming the task that fills
them in, so an accidental early call fails loudly instead of rendering blank.

```ts
import { goals } from '@/data/goals'
import { pillars } from '@/data/pillars'
import type { ContentSource } from '../source'

export const localSource: ContentSource = {
  async getGoals() {
    return goals
  },
  async getPillars() {
    return pillars
  },
  async getGovernanceBodies() {
    throw new Error('not implemented: getGovernanceBodies (Task 6)')
  },
  async getTrustees() {
    throw new Error('not implemented: getTrustees (Task 6)')
  },
  async getExecutiveCommittee() {
    throw new Error('not implemented: getExecutiveCommittee (Task 6)')
  },
  async getOutgoingTrustees() {
    throw new Error('not implemented: getOutgoingTrustees (Task 6)')
  },
  async getLeadershipYear() {
    throw new Error('not implemented: getLeadershipYear (Task 6)')
  },
  async getPrinciples() {
    throw new Error('not implemented: getPrinciples (Task 7)')
  },
  async getCriteria() {
    throw new Error('not implemented: getCriteria (Task 7)')
  },
  async getRubrics() {
    throw new Error('not implemented: getRubrics (Task 7)')
  },
  async getEndorsements() {
    throw new Error('not implemented: getEndorsements (Task 8)')
  },
  async getNews() {
    throw new Error('not implemented: getNews (Task 9)')
  },
  async getNewsBySlug() {
    throw new Error('not implemented: getNewsBySlug (Task 9)')
  },
}
```

- [ ] **Step 7: Create `lib/content/index.ts`**

```ts
import { localSource } from './local'
import type { ContentSource } from './source'

/**
 * The active content backend. To migrate to Sanity, add `lib/content/sanity/`
 * implementing ContentSource and change this one assignment.
 */
export const content: ContentSource = localSource

export * from './types'
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npm test -- content`
Expected: `6 passed`

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add site constants, eight goals and three pillars"
```

---

### Task 6: Leadership and governance

The board roster names **twelve** people. The bylaws text says the board holds between
7 and 15 elected members, so twelve is valid and complete as published. **Do not invent
a thirteenth member.**

**Files:**
- Create: `data/leadership.ts`, `data/governance.ts`
- Modify: `lib/content/local/index.ts`
- Test: `lib/content/local/leadership.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/content/local/leadership.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { content } from '@/lib/content'

describe('trustees', () => {
  it('returns the twelve named board members', async () => {
    expect(await content.getTrustees()).toHaveLength(12)
  })

  it('lists the four board officers first, in constitutional order', async () => {
    const trustees = await content.getTrustees()
    expect(trustees.slice(0, 4).map((p) => p.boardRole)).toEqual([
      'Chair',
      'Vice-Chair',
      'Treasurer',
      'Secretary',
    ])
  })

  it('names Dr. Nabil Abdel-Rahman as Chair', async () => {
    const trustees = await content.getTrustees()
    expect(trustees[0].name).toBe('Dr. Nabil Abdel-Rahman')
  })

  it('gives every trustee a unique id', async () => {
    const trustees = await content.getTrustees()
    expect(new Set(trustees.map((p) => p.id)).size).toBe(12)
  })
})

describe('executive committee', () => {
  it('returns only people holding an executive role', async () => {
    const ec = await content.getExecutiveCommittee()
    expect(ec).toHaveLength(5)
    expect(ec.every((p) => typeof p.executiveRole === 'string')).toBe(true)
  })

  it('names Nigel Edwards as President', async () => {
    const ec = await content.getExecutiveCommittee()
    expect(ec.find((p) => p.executiveRole === 'President')?.name).toBe('Nigel Edwards')
  })

  it('is derived from the trustee roster, so nobody is duplicated or drifts', async () => {
    const [ec, trustees] = await Promise.all([
      content.getExecutiveCommittee(),
      content.getTrustees(),
    ])
    const ids = new Set(trustees.map((p) => p.id))
    expect(ec.every((p) => ids.has(p.id))).toBe(true)
  })
})

describe('outgoing trustees', () => {
  it('acknowledges the twelve former trustees', async () => {
    expect(await content.getOutgoingTrustees()).toHaveLength(12)
  })

  it('includes founder Dr. Khodr Zaarour', async () => {
    const names = (await content.getOutgoingTrustees()).map((p) => p.name)
    expect(names).toContain('Dr. Khodr Zaarour')
  })
})

describe('leadership year', () => {
  it('reports the roster year so the heading can be dated honestly', async () => {
    expect(await content.getLeadershipYear()).toBe(2025)
  })
})

describe('governance bodies', () => {
  it('returns the four bodies in constitutional order', async () => {
    const bodies = await content.getGovernanceBodies()
    expect(bodies.map((b) => b.name)).toEqual([
      'Board of Trustees',
      'Executive Committee',
      'General Body',
      'Appointed Committees',
    ])
  })

  it('carries the bylaws description for each body', async () => {
    const bodies = await content.getGovernanceBodies()
    expect(bodies.every((b) => b.description.length > 80)).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- leadership`
Expected: FAIL — `not implemented: getTrustees (Task 6)`

- [ ] **Step 3: Create `data/leadership.ts`**

One roster is the single source of truth; the Executive Committee is a filter over it,
which is why the "derived from the trustee roster" test holds by construction.

```ts
import type { Person } from '@/lib/content/types'

/**
 * The year the published roster describes. The About page labels its heading with this,
 * so a stale roster reads as dated rather than as current. Update this and the roster
 * together when MAPAC confirms a new slate.
 */
export const leadershipYear = 2025

/**
 * Board of Trustees, verbatim from the About page. Officers in constitutional order
 * first, then the remaining trustees alphabetically by surname.
 * Twelve are named. The bylaws permit 7-15, so twelve is complete as published.
 */
export const trustees: Person[] = [
  { id: 'nabil-abdel-rahman', name: 'Dr. Nabil Abdel-Rahman', boardRole: 'Chair' },
  { id: 'hisham-mohamed', name: 'Dr Hisham Mohamed', boardRole: 'Vice-Chair' },
  { id: 'mohamed-kenawey', name: 'Mohamed Kenawey', boardRole: 'Treasurer' },
  { id: 'ahmad-herzallah', name: 'Ahmad Herzallah', boardRole: 'Secretary' },
  {
    id: 'majid-abdel-raziq',
    name: 'Majid Abdel-Raziq',
    executiveRole: 'Chair, Public Relations & Outreach Committee',
  },
  {
    id: 'mimi-aljabi',
    name: 'Dr. Mimi Aljabi',
    executiveRole: 'Chair, Political Action Committee',
  },
  { id: 'nigel-edwards', name: 'Nigel Edwards', executiveRole: 'President' },
  { id: 'ahmed-khalil', name: 'Dr. Ahmed Khalil', executiveRole: 'Chair, Education Committee' },
  { id: 'mohammad-omary', name: 'Mohammad Omary' },
  { id: 'shahid-shibbir', name: 'Shahid Shibbir', executiveRole: 'Chair, Media Committee' },
  { id: 'manal-sidawi', name: 'Manal Sidawi' },
  { id: 'amjad-syam', name: 'Amjad Syam' },
]

/**
 * Former trustees MAPAC acknowledges: "MAPAC acknowledges the outgoing Trustees and
 * honors their dedication and efforts to serve the Muslim community."
 */
export const outgoingTrustees: Person[] = [
  { id: 'khodr-zaarour', name: 'Dr. Khodr Zaarour' },
  { id: 'faisal-syed', name: 'Dr. Faisal Syed' },
  { id: 'aisha-shoman', name: 'Aisha Shoman' },
  { id: 'kanwal-naiyar', name: 'Kanwal Naiyar' },
  { id: 'ford-chambliss', name: 'Ford Chambliss' },
  { id: 'jihad-shawwa', name: 'Jihad Shawwa' },
  { id: 'musa-lipford', name: 'Musa Lipford' },
  { id: 'elham-idris', name: 'Elham Idris' },
  { id: 'fatima-anam', name: 'Fatima Anam' },
  { id: 'khalid-awan', name: 'Khalid Awan' },
  { id: 'sohaila-dar', name: 'Sohaila Dar' },
  { id: 'zainab-abdul-qaabidh-amir', name: 'Zainab Abdul-Qaabidh Amir' },
]
```

- [ ] **Step 4: Create `data/governance.ts`**

Descriptions are the bylaws text from the About page, lightly reflowed. Do not
substitute your own summaries.

```ts
import type { GovernanceBody } from '@/lib/content/types'

/** MAPAC NC is composed of four bodies. Descriptions from the published bylaws text. */
export const governanceBodies: GovernanceBody[] = [
  {
    id: 'board-of-trustees',
    name: 'Board of Trustees',
    description:
      'The legislative body of MAPAC NC. It consists of not less than 7 nor more than fifteen (15) elected members drawn from the Voting Members of the General Body. Each member serves a period of three consecutive years.',
  },
  {
    id: 'executive-committee',
    name: 'Executive Committee',
    description:
      'The Executive Committee consists of the MAPAC President, who acts as its Chair, the Standing Committee Chairs, the MAPAC Secretary and the MAPAC Treasurer. Board of Trustees members are also considered pro forma members of the Executive Committee.',
  },
  {
    id: 'general-body',
    name: 'General Body',
    description:
      'The membership, in two groups. Voting Members are paid members who agree to the constitution and By Laws, have paid their dues, and maintain their membership as required. Associate Members are non-Muslim members of the community who join for personal reasons; they are exempt from voting and are not eligible for Board or Executive Committee membership, but enjoy all other benefits of membership, including discounted entry to events and free entry to educational events upon availability.',
  },
  {
    id: 'appointed-committees',
    name: 'Appointed Committees',
    description:
      'From time to time the Board or the Executive Committee may appoint ad hoc or standing committees. Their purpose is to distribute day-to-day tasks among members so they are completed in a timely manner, and to provide leadership training so the organization continuously develops future leaders.',
  },
]
```

- [ ] **Step 5: Replace the five throwing methods in `lib/content/local/index.ts`**

Add these imports at the top:

```ts
import { governanceBodies } from '@/data/governance'
import { leadershipYear, outgoingTrustees, trustees } from '@/data/leadership'
```

Replace the five throwing methods with:

```ts
  async getGovernanceBodies() {
    return governanceBodies
  },
  async getTrustees() {
    return trustees
  },
  async getExecutiveCommittee() {
    return trustees.filter((p) => p.executiveRole)
  },
  async getOutgoingTrustees() {
    return outgoingTrustees
  },
  async getLeadershipYear() {
    return leadershipYear
  },
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npm test -- leadership`
Expected: `11 passed`

- [ ] **Step 7: Run the whole suite to confirm nothing regressed**

Run: `npm test`
Expected: all tests pass (17 total so far)

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add leadership roster, outgoing trustees and governance bodies"
```

---

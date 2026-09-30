# MAPAC Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build MAPAC's website as a Next.js 15 site carrying over all evergreen content from mapacnc.com, excluding every outdated election artifact.

**Architecture:** Next 16 was installed by `create-next-app@latest` in Task 1; the plan was written against 15 and the two agree on every API used here. Static-rendered App Router pages read all content through a single swappable adapter (`lib/content`) so Sanity can replace in-repo data later without touching components. Four Node-runtime API routes handle forms and Stripe Checkout; each integration degrades to a working fallback when its env var is absent, so the site is deployable before any credential exists.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, `next/font` (Source Serif 4 + Inter), Vitest, Playwright + axe-core, Stripe Checkout, Resend.

**Spec:** `docs/superpowers/specs/2026-09-25-mapac-website-design.md`

> ### Deviation log — read before Tasks 10, 11 and 13
>
> A code-quality review of Tasks 2-3 found that a single hardcoded focus-ring colour
> cannot meet WCAG 1.4.11 on both surfaces: crimson on white is 5.94:1, but crimson on
> navy `#022047` is only **2.72:1** (navy-800 2.22:1, navy-700 1.73:1) against a 3:1
> floor. White clears it on navy (16.15:1) but fails on white.
>
> The implemented `app/globals.css` therefore differs from Task 2 as written. It defines
> two custom properties, `--focus-ring` (default crimson) and `--heading-color` (default
> navy), and a plain class **`.on-navy`** that flips both to white.
>
> **Every CONTAINER that paints a navy region for other content to sit inside MUST also
> carry `on-navy`** — the header, the mobile nav panel, the hero, the CTA band, the footer,
> and the skip link. Without it, keyboard focus is near-invisible on that surface and any
> heading inside renders navy-on-navy (~1:1), which the axe gate in Task 28 will fail the
> build on.
>
> **The inverse trap:** do NOT put `on-navy` on a small navy element such as `Button`'s
> `secondary` variant. The ring uses `outline-offset`, so it renders just *outside* the
> element on the parent's background — normally white, where a white ring is 1:1 and
> invisible. Such an element inherits `on-navy` from its navy ancestor when it sits in one,
> which is already correct in both cases. Scope the class to containers only.
>
> `Button` also gained a discriminated-union prop type (anchor attributes when `href` is
> present, button attributes when absent), rest-prop spreading on all three branches, a
> scheme-aware external-link test, a default `type="button"`, and disabled styling.
> A `lib/cn.ts` helper wrapping `tailwind-merge` now composes classes in all four
> primitives, so a caller's `className` reliably wins.

**Phases:** Each phase ends with the site building and deployable.
- Phase 0 (Tasks 1–3): scaffold, tokens, UI primitives
- Phase 1 (Tasks 4–9): content layer
- Phase 2 (Tasks 10–12): layout shell
- Phase 3 (Tasks 13–18): pages
- Phase 4 (Tasks 19–24): forms
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

export type ResourceLink = {
  label: string
  url?: string
}

/** One category from the guide's "Tools for Researching Candidates". */
export type ResearchCategory = {
  id: string
  title: string
  description: string
  links: ResourceLink[]
}

/** Office-level evaluation guidance from the guide. */
export type OfficeGuidance = {
  id: string
  office: string
  intro: string
  criteria: string[]
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
  OfficeGuidance,
  Person,
  Pillar,
  Principle,
  ResearchCategory,
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
  /** Office-level evaluation guidance from the endorsement guide. */
  getOfficeGuidance(): Promise<OfficeGuidance[]>
  /** Voter-research resources from the endorsement guide. */
  getResearchCategories(): Promise<ResearchCategory[]>
  /** Empty array means the Elections page renders no endorsements section. */
  getEndorsements(): Promise<Endorsement[]>
  /** Newest first. Bodies omitted. */
  getNews(): Promise<NewsItem[]>
  /** Null when no post has that slug. */
  getNewsBySlug(slug: string): Promise<NewsItem | null>
}
```

- [ ] **Step 3: Verify it typechecks**

Run: `npx tsc --noEmit`
Expected: no output (success)

- [ ] **Step 4: Commit**

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
  async getOfficeGuidance() {
    throw new Error('not implemented: getOfficeGuidance (Task 7)')
  },
  async getResearchCategories() {
    throw new Error('not implemented: getResearchCategories (Task 7)')
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
---

### Task 7: Endorsement framework — principles, criteria, rubrics

All content here comes from `MAPAC-2026-Endorsement-Guide.pdf`. Per the spec's
"Endorsement guide detail level" decision, the principles are the **condensed** paragraph
the old website displayed, not the PDF's full values outline.

**Files:**
- Create: `data/endorsement.ts`
- Modify: `lib/content/local/index.ts`
- Test: `lib/content/local/endorsement.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/content/local/endorsement.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { content } from '@/lib/content'
import { CRITERIA_ORDER } from '@/data/endorsement'

describe('criteria', () => {
  it('returns the eight evaluation criteria in the guide order', async () => {
    const criteria = await content.getCriteria()
    expect(criteria.map((c) => c.title)).toEqual([
      'Engagement with the Muslim Community',
      'Qualifications and Capabilities',
      'Commitment to Civil Liberties',
      'Integrity and Ethics',
      'Policy Positions, Platform, & Vision',
      'Performance Record',
      'Stance on Foreign Policy',
      'Electability and Campaign Standing',
    ])
  })

  it('gives every criterion a most-favorable description', async () => {
    const criteria = await content.getCriteria()
    expect(criteria.every((c) => c.description.length > 40)).toBe(true)
  })
})

describe('rubrics', () => {
  it('returns one rubric per office level', async () => {
    const rubrics = await content.getRubrics()
    expect(rubrics.map((r) => r.office)).toEqual([
      'Local, City, and County Officials',
      'Judiciary',
      'State Legislature',
      'State Executive Officials',
      'Federal Legislature',
    ])
  })

  it('every rubric totals 100 percentage points', async () => {
    const rubrics = await content.getRubrics()
    for (const rubric of rubrics) {
      const total = rubric.rows.reduce((sum, row) => sum + row.weight * 5, 0)
      expect(total, `${rubric.office} must total 100`).toBe(100)
    }
  })

  it('every rubric scores all eight criteria, in the same order', async () => {
    const rubrics = await content.getRubrics()
    for (const rubric of rubrics) {
      expect(rubric.rows.map((r) => r.criterion)).toEqual(CRITERIA_ORDER)
    }
  })

  it('weights Stance on Foreign Policy highest for Federal Legislature', async () => {
    const rubrics = await content.getRubrics()
    const federal = rubrics.find((r) => r.office === 'Federal Legislature')!
    const foreign = federal.rows.find((r) => r.criterion === 'Stance on Foreign Policy')!
    expect(foreign.weight).toBe(4)
  })

  it('weights Commitment to Civil Liberties and Integrity highest for Judiciary', async () => {
    const rubrics = await content.getRubrics()
    const judiciary = rubrics.find((r) => r.office === 'Judiciary')!
    const byName = Object.fromEntries(judiciary.rows.map((r) => [r.criterion, r.weight]))
    expect(byName['Commitment to Civil Liberties']).toBe(4)
    expect(byName['Integrity and Ethics']).toBe(4)
  })
})

describe('principles', () => {
  it('returns the condensed principles the old site published', async () => {
    const principles = await content.getPrinciples()
    expect(principles.length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- endorsement`
Expected: FAIL — cannot resolve `@/data/endorsement`

- [ ] **Step 3: Create `data/endorsement.ts`**

Weight factors are transcribed from the PDF's rubric tables. Percentage points are
always `weight * 5`, so only the weight is stored — that is why the "totals 100" test is
a real check on the transcription rather than a tautology.

```ts
import type { Criterion, Principle, Rubric } from '@/lib/content/types'

/** Canonical criterion order, used by every rubric. */
export const CRITERIA_ORDER = [
  'Engagement with the Muslim Community',
  'Qualifications and Capabilities',
  'Commitment to Civil Liberties',
  'Integrity and Ethics',
  'Policy Positions, Platform, & Vision',
  'Performance Record',
  'Stance on Foreign Policy',
  'Electability and Campaign Standing',
] as const

/** The 1-5 scale from the guide. */
export const SCORING_SCALE = [
  { score: 1, label: 'Very Poor' },
  { score: 2, label: 'Poor' },
  { score: 3, label: 'Fair' },
  { score: 4, label: 'Good' },
  { score: 5, label: 'Excellent' },
] as const

/** Both hard rules, verbatim in substance from the guide. */
export const DISQUALIFICATIONS = [
  'Candidates exhibiting hatred or contempt towards Muslims or their faith are automatically disqualified from endorsement, as such attitudes violate the principles of tolerance and respect on which this country is founded.',
  'MAPAC will not support candidates who support or condone the persecution or killing of Muslims abroad.',
] as const

export const ENDORSEMENT_REQUIREMENT =
  'MAPAC endorsements require direct contact between the endorsement team and the candidate.'

export const GUIDE_PDF_URL =
  'https://mapacnc.com/wp-content/uploads/2026/02/MAPAC-2026-Endorsement-Guide.pdf'

/**
 * The condensed principles, as the old Endorsement Guide page published them. The PDF's
 * fuller values outline is deliberately not reproduced here; see the spec's
 * "Endorsement guide detail level" decision.
 */
export const principles: Principle[] = [
  { id: 'religious-freedom', text: 'Protecting freedom of religion and civil liberties.' },
  {
    id: 'dignity',
    text: 'Respecting the dignity of all people and rejecting rhetoric that targets religious or immigrant communities.',
  },
  {
    id: 'moral-values',
    text: 'Upholding faith, family, moral values, and the sanctity of life.',
  },
  {
    id: 'justice',
    text: 'Committing to justice, honesty, and the equal application of the law.',
  },
  { id: 'education', text: 'Supporting parental rights and educational choice.' },
  {
    id: 'fiscal',
    text: 'Practicing fiscal responsibility to reduce burdens on working families.',
  },
  { id: 'overreach', text: 'Opposing government overreach and abuse of power.' },
  {
    id: 'domestic-priority',
    text: 'Prioritizing domestic needs over foreign wars and excessive foreign aid.',
  },
  {
    id: 'holy-sites',
    text: 'Protecting Muslim holy sites and access to worship in Jerusalem.',
  },
  {
    id: 'transparency',
    text: 'Advancing transparency, accountability, and limits on undue special-interest influence in government.',
  },
]

/** Descriptions are the guide's "most favorable description" for each criterion. */
export const criteria: Criterion[] = [
  {
    id: 'community-engagement',
    title: 'Engagement with the Muslim Community',
    description:
      'Exhibits understanding and actively engages in dialogue with the community, accepts our invitations and presents respectfully during attendance of candidate forums, and goes beyond statements of tolerance by involving our community in initiatives.',
  },
  {
    id: 'qualifications',
    title: 'Qualifications and Capabilities',
    description:
      'Relevant experience, education, and leadership skills, together with the ability to work with others, make decisions, and handle crises.',
  },
  {
    id: 'civil-liberties',
    title: 'Commitment to Civil Liberties',
    description:
      'Supports the Muslim community’s freedom to practice our faith, organize, and exercise our constitutional rights without fear of persecution. Supports ending the weaponization of government against the American people, including Fourth Amendment violations by government agencies and the lack of judicial oversight, and supports restoring civil liberties by repealing the Patriot Act and FISA. Appreciates the diversity of the American people, and supports unequivocally the constitutional right to protest peacefully and to boycott, divest from, and call for sanctions of any foreign entity.',
  },
  {
    id: 'integrity',
    title: 'Integrity and Ethics',
    description:
      'A record of honesty, transparency, and ethical behavior; willingness to take responsibility for actions and decisions; consistency in statements, promises, and actions over time; no strong leanings towards special interests or acceptance of Super PAC and corporate lobby money; and debates with civility, expressing disagreement in a manner fitting of a leader.',
  },
  {
    id: 'policy-vision',
    title: 'Policy Positions, Platform, & Vision',
    description:
      'Expresses well developed strategic plans for major issues such as healthcare, criminal justice and law enforcement, education, the economy, and the environment; offers a clear and compelling long-term vision for their constituency; aligns with MAPAC’s values and priorities; and proposes policies that are clear, practical, and achievable.',
  },
  {
    id: 'performance-record',
    title: 'Performance Record',
    description:
      'Evaluated on effectiveness, track record, and previous positions, whether public or private, and their performance there. Incumbents with a record of performing favorably and effectively are favored by this criterion; incumbents with a poor track record are penalized.',
  },
  {
    id: 'foreign-policy',
    title: 'Stance on Foreign Policy',
    description:
      'Vocal and adamant about stopping US interventionism, including involvement in foreign wars, and advocates focusing government resources on domestic issues that benefit the American public.',
  },
  {
    id: 'electability',
    title: 'Electability and Campaign Standing',
    description:
      'Shows public momentum through polling, media coverage, or grassroots engagement; runs a well-structured, disciplined campaign; demonstrates meaningful party and institutional support; is backed by credible individuals, coalitions, or movements; maintains transparent and ethical fundraising with a demonstrated ability to mobilize resources; and holds current office or relevant prior experience that strengthens credibility.',
  },
]

/**
 * Weight factors transcribed from the guide's five rubric tables, in CRITERIA_ORDER.
 * Percentage points are weight * 5; each row set must total 100.
 */
const WEIGHTS: Record<string, readonly number[]> = {
  'Local, City, and County Officials': [4, 2, 2, 3, 3, 3, 1, 2],
  Judiciary: [3, 3, 4, 4, 1, 2, 1, 2],
  'State Legislature': [3, 3, 3, 2, 3, 3, 1, 2],
  'State Executive Officials': [4, 3, 3, 3, 2, 2, 1, 2],
  'Federal Legislature': [3, 2, 2, 3, 2, 2, 4, 2],
}

const RUBRIC_IDS: Record<string, string> = {
  'Local, City, and County Officials': 'local',
  Judiciary: 'judiciary',
  'State Legislature': 'state-legislature',
  'State Executive Officials': 'state-executive',
  'Federal Legislature': 'federal-legislature',
}

export const rubrics: Rubric[] = Object.entries(WEIGHTS).map(([office, weights]) => ({
  id: RUBRIC_IDS[office],
  office,
  rows: CRITERIA_ORDER.map((criterion, i) => ({ criterion, weight: weights[i] })),
}))
```

- [ ] **Step 4: Replace the three throwing methods in `lib/content/local/index.ts`**

Add the import:

```ts
import { criteria, principles, rubrics } from '@/data/endorsement'
```

Replace the three throwing methods with:

```ts
  async getPrinciples() {
    return principles
  },
  async getCriteria() {
    return criteria
  },
  async getRubrics() {
    return rubrics
  },
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- endorsement`
Expected: `8 passed`

If "every rubric totals 100 percentage points" fails, a weight was mistranscribed from
the PDF. Re-read the failing office's table; do not adjust the test to match the data.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add endorsement principles, criteria and weighted rubrics"
```

- [ ] **Step 7: Write the failing test for office guidance and research resources**

Create `lib/content/local/guidance.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { content } from '@/lib/content'

describe('office guidance', () => {
  it('covers the five office groups the guide discusses', async () => {
    const guidance = await content.getOfficeGuidance()
    expect(guidance.map((g) => g.office)).toEqual([
      'Local offices',
      'City councils and county commissioners',
      'Boards of education',
      'Judicial offices',
      'State legislative offices',
    ])
  })

  it('gives every office group substantive prose guidance', async () => {
    const guidance = await content.getOfficeGuidance()
    expect(guidance.every((g) => g.intro.length > 80)).toBe(true)
  })

  it('carries the bulleted criteria for the four groups the guide lists them for', async () => {
    // The guide's "Appropriate criteria for evaluation include:" lists appear under
    // every group EXCEPT Local offices, whose guidance is prose only. An empty array
    // there is correct; inventing bullets to fill it would fabricate MAPAC's positions.
    const guidance = await content.getOfficeGuidance()
    const byId = Object.fromEntries(guidance.map((g) => [g.id, g.criteria.length]))
    expect(byId.local).toBe(0)
    expect(byId.councils).toBeGreaterThan(0)
    expect(byId.education).toBeGreaterThan(0)
    expect(byId.judicial).toBeGreaterThan(0)
    expect(byId['state-legislative']).toBeGreaterThan(0)
  })
})

describe('research categories', () => {
  it('returns the ten categories from the guide', async () => {
    const categories = await content.getResearchCategories()
    expect(categories).toHaveLength(10)
  })

  it('gives every category a unique id', async () => {
    const categories = await content.getResearchCategories()
    expect(new Set(categories.map((c) => c.id)).size).toBe(10)
  })

  it('uses absolute https urls for every link that has one', async () => {
    const categories = await content.getResearchCategories()
    const urls = categories.flatMap((c) => c.links.map((l) => l.url)).filter(Boolean)
    expect(urls.length).toBeGreaterThan(0)
    expect(urls.every((u) => u!.startsWith('https://'))).toBe(true)
  })
})
```

- [ ] **Step 8: Run test to verify it fails**

Run: `npm test -- guidance`
Expected: FAIL — `not implemented: getOfficeGuidance (Task 7)`

- [ ] **Step 9: Create `data/guidance.ts`**

Content is from pages 8-10 of the endorsement guide. Links are exactly as the guide lists
them; do not substitute alternatives.

```ts
import type { OfficeGuidance, ResearchCategory } from '@/lib/content/types'

export const officeGuidance: OfficeGuidance[] = [
  {
    id: 'local',
    office: 'Local offices',
    intro:
      'Virtually all North Carolina municipalities have adopted the Mayor-Council-City Manager form of government. Under this arrangement a Mayor has few direct powers, and to be effective must rely on their vision for effective city government, consensus-building skills, and communication skills. Mayoral candidates should be evaluated accordingly.',
    criteria: [],
  },
  {
    id: 'councils',
    office: 'City councils and county commissioners',
    intro:
      'City councils and county commissioners are deliberative bodies who can and should set policies, but whose direct executive powers are limited outside of the control of budgets and the appointment of members of various boards and special commissions.',
    criteria: [
      'Understanding of the statutory role and legal limitations imposed on city councils and county boards of commissioners',
      'Understanding of the proper roles of city and county managers and professional staffs',
      'Understanding of the interactive workings of various city and county appointed boards and commissions, and those of different professional staff organizations',
      'Understanding of the various review, permitting and other city and county approval processes',
      'Understanding of the budgetary process',
      'Understanding of capital funding and operational funding options available to cities and counties',
      'Commitment to affordable housing and increasing economic opportunity, particularly for the poor and lower middle class',
    ],
  },
  {
    id: 'education',
    office: 'Boards of education',
    intro:
      'Boards of education are somewhat like county commissioners and city councils, but with a much narrower scope of interests.',
    criteria: [
      'Commitment to and advocacy for publicly funded, universally available education',
      'Understanding of the statutory role and legal limitations of a board of education',
      'Understanding of the proper roles of professional staffs',
      'Understanding of the budgetary process and funding sources available to the county',
      'Having the confidence of, and sharing the general views of, one or more significant community segments — particularly parents, teachers, and the community groups whose backing is necessary for securing critical funding',
    ],
  },
  {
    id: 'judicial',
    office: 'Judicial offices',
    intro:
      'While federal judges are appointed by the executive branch subject to approval of the US Senate, in North Carolina all judge positions are decided by election. Vacancies created by retirements, deaths or other causes are filled by executive appointment, but only until the next regular election for that judgeship. Other than some extremely minimal requirements, it is the general electorate who decide on judicial candidates.',
    criteria: [
      'For Supreme Court and appellate court candidates: a thorough knowledge of the law, of legal precedents and principles, and of the proper workings of the overall court system. These courts act as courts of original jurisdiction only in extremely limited circumstances, and ordinarily consider points of law related to appealed lower-court rulings. Extensive legal proceedings experience and mastery of the more academic aspects of the law are major considerations.',
      'For lower court candidates: lower courts are where criminal proceedings, both misdemeanor and felony, are held, where civil suits are heard, and where family law matters are decided. Lower court judges deal more directly with the public and require more people skills and administrative skills, in addition to a sound understanding of the law and a commitment to justice within the law.',
    ],
  },
  {
    id: 'state-legislative',
    office: 'State legislative offices',
    intro:
      'The qualifications for State Senate and State House of Representatives are similar in many ways to those for city council and county commissioners, with some additional qualifications reflective of the unique nature of the State Legislature.',
    criteria: [
      'Understanding of the constitutional duties of the legislature, and the limitations the legislature has imposed on local units of government',
      'Understanding of the intricacies of the legislative approval process and committee system',
      'Commitment to the democratic process, and the elimination of gerrymandering and voter suppression methods used to directly or indirectly disenfranchise voters',
      'Commitment to civil rights and racial equality',
    ],
  },
]

export const researchCategories: ResearchCategory[] = [
  {
    id: 'campaign-websites',
    title: 'Official campaign websites',
    description:
      'Candidates’ official sites often provide their platforms, biographies, and positions on various issues.',
    links: [],
  },
  {
    id: 'social-media',
    title: 'Social media',
    description:
      'Candidates frequently use X, Facebook and Instagram to communicate their policies, respond to current events, and engage with the public.',
    links: [],
  },
  {
    id: 'government',
    title: 'Government websites',
    description:
      'For federal candidates, these sites provide records of legislative activities, sponsored bills, and voting history.',
    links: [
      { label: 'Congress.gov', url: 'https://www.congress.gov' },
      { label: 'Senate.gov', url: 'https://www.senate.gov' },
      { label: 'House.gov', url: 'https://www.house.gov' },
      { label: 'NC General Assembly votes', url: 'https://www.ncleg.gov/Legislation/Votes' },
    ],
  },
  {
    id: 'election-databases',
    title: 'Election databases',
    description:
      'Comprehensive information on candidates’ backgrounds, previous elections, and issue positions.',
    links: [
      { label: 'Ballotpedia', url: 'https://ballotpedia.org' },
      { label: 'VoteSmart', url: 'https://justfacts.votesmart.org' },
    ],
  },
  {
    id: 'fact-checking',
    title: 'Fact-checking sites',
    description: 'Verify the accuracy of candidates’ statements and claims.',
    links: [
      { label: 'PolitiFact', url: 'https://www.politifact.com' },
      { label: 'FactCheck.org', url: 'https://www.factcheck.org' },
    ],
  },
  {
    id: 'news',
    title: 'News outlets',
    description:
      'Coverage of candidates’ campaigns, controversies, and public appearances.',
    links: [],
  },
  {
    id: 'public-records',
    title: 'Public records databases',
    description:
      'State or local public records offices, for campaign finance, legal issues, or other relevant public records.',
    links: [],
  },
  {
    id: 'debates',
    title: 'Debates and interviews',
    description:
      'Recordings of debates, interviews, and speeches let you assess candidates’ communication skills and policy positions. Some of the best in North Carolina:',
    links: [
      { label: 'PBS North Carolina', url: 'https://www.youtube.com/@MyPBSNC/videos' },
      { label: 'WUNC Politics Podcast', url: 'https://www.npr.org/podcasts/477514874/w-u-n-c-politics' },
      {
        label: 'Do Politics Better',
        url: 'https://podcasts.apple.com/us/podcast/do-politics-better-podcast/id1557257071',
      },
    ],
  },
  {
    id: 'analysis',
    title: 'Political analysis sites',
    description: 'In-depth analysis of election data, polling, and political trends.',
    links: [
      { label: 'FiveThirtyEight', url: 'https://projects.fivethirtyeight.com' },
      { label: 'The Cook Political Report', url: 'https://www.cookpolitical.com' },
    ],
  },
  {
    id: 'campaign-finance',
    title: 'Campaign finance reports',
    description:
      'Details of campaign contributions and expenditures — the FEC for federal candidates, state election boards for local candidates.',
    links: [
      { label: 'Federal Election Commission', url: 'https://www.fec.gov' },
      { label: 'NC State Board of Elections', url: 'https://www.ncsbe.gov' },
    ],
  },
]
```

- [ ] **Step 10: Replace the two throwing methods in `lib/content/local/index.ts`**

Add the import:

```ts
import { officeGuidance, researchCategories } from '@/data/guidance'
```

Replace the two throwing methods with:

```ts
  async getOfficeGuidance() {
    return officeGuidance
  },
  async getResearchCategories() {
    return researchCategories
  },
```

- [ ] **Step 11: Run test to verify it passes**

Run: `npm test -- guidance`
Expected: `5 passed`


- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: add office-level guidance and voter research resources"
```

---

### Task 8: Endorsements (ships empty)

The endorsements collection ships **empty on purpose**. This is the mechanism that keeps
the site from ever again carrying a stale election page: when the array is empty the
Elections page renders no endorsements section at all — no heading, no "check back
soon". Never seed this with example data.

**Files:**
- Create: `data/endorsements.ts`
- Modify: `lib/content/local/index.ts`
- Test: `lib/content/local/endorsements.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/content/local/endorsements.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { content } from '@/lib/content'
import type { Endorsement } from '@/lib/content/types'
import { groupByCycle, sortEndorsements } from '@/data/endorsements'

describe('endorsements', () => {
  it('ships empty, so the Elections page renders no endorsements section', async () => {
    expect(await content.getEndorsements()).toEqual([])
  })
})

describe('sortEndorsements', () => {
  it('orders newest first', () => {
    const items: Endorsement[] = [
      { id: 'a', candidate: 'A', office: 'Mayor', cycle: 'Nov 2026', date: '2026-09-01' },
      { id: 'b', candidate: 'B', office: 'Mayor', cycle: 'Nov 2026', date: '2026-10-01' },
    ]
    expect(sortEndorsements(items).map((e) => e.id)).toEqual(['b', 'a'])
  })

  it('does not mutate its input', () => {
    const items: Endorsement[] = [
      { id: 'a', candidate: 'A', office: 'Mayor', cycle: 'Nov 2026', date: '2026-09-01' },
      { id: 'b', candidate: 'B', office: 'Mayor', cycle: 'Nov 2026', date: '2026-10-01' },
    ]
    sortEndorsements(items)
    expect(items.map((e) => e.id)).toEqual(['a', 'b'])
  })
})

describe('groupByCycle', () => {
  it('returns an empty array for no endorsements', () => {
    expect(groupByCycle([])).toEqual([])
  })

  it('groups by cycle, newest cycle first', () => {
    const items: Endorsement[] = [
      { id: 'a', candidate: 'A', office: 'Mayor', cycle: 'Nov 2026', date: '2026-10-01' },
      { id: 'b', candidate: 'B', office: 'Judge', cycle: 'Mar 2028', date: '2028-01-05' },
      { id: 'c', candidate: 'C', office: 'Council', cycle: 'Nov 2026', date: '2026-09-01' },
    ]
    const groups = groupByCycle(items)
    expect(groups.map((g) => g.cycle)).toEqual(['Mar 2028', 'Nov 2026'])
    expect(groups[1].endorsements.map((e) => e.id)).toEqual(['a', 'c'])
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- endorsements`
Expected: FAIL — cannot resolve `@/data/endorsements`

- [ ] **Step 3: Create `data/endorsements.ts`**

```ts
import type { Endorsement } from '@/lib/content/types'

/**
 * MAPAC's published endorsements.
 *
 * SHIPS EMPTY ON PURPOSE. An empty array means the Elections page renders no
 * endorsements section — that is what prevents a stale election page. Add entries only
 * when MAPAC has actually published an endorsement. Do not seed example data.
 */
export const endorsements: Endorsement[] = []

/** Newest first. Returns a new array; does not mutate the input. */
export function sortEndorsements(items: Endorsement[]): Endorsement[] {
  return [...items].sort((a, b) => b.date.localeCompare(a.date))
}

export type CycleGroup = {
  cycle: string
  endorsements: Endorsement[]
}

/** Groups endorsements by cycle, newest cycle first, newest within each cycle first. */
export function groupByCycle(items: Endorsement[]): CycleGroup[] {
  const sorted = sortEndorsements(items)
  const groups: CycleGroup[] = []
  for (const item of sorted) {
    const existing = groups.find((g) => g.cycle === item.cycle)
    if (existing) {
      existing.endorsements.push(item)
    } else {
      groups.push({ cycle: item.cycle, endorsements: [item] })
    }
  }
  return groups
}
```

- [ ] **Step 4: Replace the throwing method in `lib/content/local/index.ts`**

Add the import:

```ts
import { endorsements } from '@/data/endorsements'
```

Replace `getEndorsements` with:

```ts
  async getEndorsements() {
    return endorsements
  },
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- endorsements`
Expected: `5 passed`

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add endorsements collection, empty by design"
```

---

### Task 9: News from MDX

News also ships with zero posts. The index must handle that without looking broken.

**Files:**
- Create: `content/news/.gitkeep`
- Create: `lib/content/local/news.ts`
- Modify: `lib/content/local/index.ts`
- Test: `lib/content/local/news.test.ts`

- [ ] **Step 1: Install MDX dependencies**

```bash
npm install gray-matter next-mdx-remote
```

If `next-mdx-remote/rsc` fails to render under Next 16 (it peers only on `react: >=16`, so
it is not version-locked, but this is unverified), switch to `@next/mdx` — the
Vercel-maintained alternative, versioned in lockstep with Next — and report the swap as a
concern rather than working around it.

- [ ] **Step 2: Write the failing test**

Create `lib/content/local/news.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { parseNewsFile } from './news'

describe('parseNewsFile', () => {
  it('parses frontmatter and body', () => {
    const raw = `---
title: MAPAC Statement on Voter Access
date: 2026-10-01
summary: A short summary.
---

The body of the statement.`
    const item = parseNewsFile('voter-access.mdx', raw)
    expect(item.slug).toBe('voter-access')
    expect(item.title).toBe('MAPAC Statement on Voter Access')
    expect(item.date).toBe('2026-10-01')
    expect(item.summary).toBe('A short summary.')
    expect(item.body).toContain('The body of the statement.')
  })

  it('normalises a Date object from YAML into an ISO date string', () => {
    const raw = `---
title: T
date: 2026-01-05
summary: S
---
Body`
    expect(parseNewsFile('t.mdx', raw).date).toBe('2026-01-05')
  })

  it('throws a useful error when title is missing', () => {
    const raw = `---
date: 2026-01-05
summary: S
---
Body`
    expect(() => parseNewsFile('broken.mdx', raw)).toThrow(/broken\.mdx.*title/i)
  })

  it('throws a useful error when date is missing', () => {
    const raw = `---
title: T
summary: S
---
Body`
    expect(() => parseNewsFile('nodate.mdx', raw)).toThrow(/nodate\.mdx.*date/i)
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- news`
Expected: FAIL — cannot resolve `./news`

- [ ] **Step 4: Create `lib/content/local/news.ts`**

```ts
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import matter from 'gray-matter'
import type { NewsItem } from '../types'

const NEWS_DIR = path.join(process.cwd(), 'content', 'news')

/** YAML parses an unquoted date into a Date; normalise both forms to YYYY-MM-DD. */
function toIsoDate(value: unknown): string | null {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  if (typeof value === 'string' && value.trim()) return value.trim().slice(0, 10)
  return null
}

export function parseNewsFile(filename: string, raw: string): NewsItem {
  const { data, content: body } = matter(raw)
  const slug = filename.replace(/\.mdx?$/, '')

  if (typeof data.title !== 'string' || !data.title.trim()) {
    throw new Error(`content/news/${filename}: missing required frontmatter "title"`)
  }
  const date = toIsoDate(data.date)
  if (!date) {
    throw new Error(`content/news/${filename}: missing or invalid frontmatter "date"`)
  }

  return {
    slug,
    title: data.title.trim(),
    date,
    summary: typeof data.summary === 'string' ? data.summary.trim() : '',
    body,
  }
}

/** Returns [] when the directory is absent or holds no posts, rather than throwing. */
async function readAll(): Promise<NewsItem[]> {
  let filenames: string[]
  try {
    filenames = await readdir(NEWS_DIR)
  } catch {
    return []
  }

  const posts = await Promise.all(
    filenames
      .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'))
      .map(async (f) => parseNewsFile(f, await readFile(path.join(NEWS_DIR, f), 'utf8'))),
  )

  return posts.sort((a, b) => b.date.localeCompare(a.date))
}

/** Newest first, bodies stripped for the index. */
export async function getNews(): Promise<NewsItem[]> {
  const posts = await readAll()
  return posts.map(({ body: _body, ...rest }) => rest)
}

export async function getNewsBySlug(slug: string): Promise<NewsItem | null> {
  const posts = await readAll()
  return posts.find((p) => p.slug === slug) ?? null
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- news`
Expected: `4 passed`

- [ ] **Step 6: Create the empty news directory**

```bash
mkdir -p content/news
touch content/news/.gitkeep
```

- [ ] **Step 7: Replace the last two throwing methods in `lib/content/local/index.ts`**

Add the import:

```ts
import { getNews, getNewsBySlug } from './news'
```

Replace the two throwing methods with:

```ts
  getNews,
  getNewsBySlug,
```

- [ ] **Step 8: Verify no method still throws**

Run: `grep -n "not implemented" lib/content/local/index.ts`
Expected: no output. If anything matches, that method was missed.

- [ ] **Step 9: Run the whole suite**

Run: `npm test`
Expected: all tests pass (34 total)

- [ ] **Step 10: Add the stub tripwire**

Task 9 is the last task that replaces a `not implemented` stub. Add a test that fails if
any stub ever survives, so a forgotten one is a fast isolated signal rather than a
build-time surprise on an unrelated page.

Create `lib/content/completeness.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { content } from '@/lib/content'

describe('ContentSource completeness', () => {
  it('has no method left throwing "not implemented"', async () => {
    const names = Object.keys(content) as (keyof typeof content)[]
    expect(names.length).toBe(15)

    const stubs: string[] = []
    for (const name of names) {
      try {
        // getNewsBySlug is the only method taking an argument; a miss returns null.
        await (content[name] as (arg?: unknown) => Promise<unknown>)('nonexistent-slug')
      } catch (error) {
        if (error instanceof Error && error.message.includes('not implemented')) {
          stubs.push(name)
        } else {
          throw error
        }
      }
    }

    expect(stubs, `these ContentSource methods are still stubs: ${stubs.join(', ')}`).toEqual([])
  })
})
```

- [ ] **Step 11: Run it**

Run: `npm test -- completeness`
Expected: `1 passed`. A failure names exactly which methods are still stubs.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: read news from MDX, handling the empty case"
```

---
## Phase 2 — Layout shell

### Task 10: Navigation and header

**Files:**
- Create: `data/nav.ts`, `components/layout/SkipLink.tsx`, `components/layout/Header.tsx`, `components/layout/MobileNav.tsx`
- Test: `data/nav.test.ts`

- [ ] **Step 1: Write the failing test**

Create `data/nav.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { primaryNav, footerNav } from './nav'

describe('primaryNav', () => {
  it('is the consolidated seven-item nav from the spec', () => {
    expect(primaryNav.map((i) => i.label)).toEqual([
      'About',
      'Elections',
      'Get Involved',
      'News',
      'Donate',
      'Contact',
    ])
  })

  it('contains no link to the retired 2026 primary page', () => {
    const hrefs = [...primaryNav, ...footerNav].map((i) => i.href)
    expect(hrefs.some((h) => h.includes('2026primary'))).toBe(false)
  })

  it('uses root-relative hrefs only', () => {
    expect(primaryNav.every((i) => i.href.startsWith('/'))).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- nav`
Expected: FAIL — cannot resolve `./nav`

- [ ] **Step 3: Create `data/nav.ts`**

```ts
export type NavItem = {
  label: string
  href: string
}

/** Home is the logo, so it is not repeated as a nav item. */
export const primaryNav: NavItem[] = [
  { label: 'About', href: '/about' },
  { label: 'Elections', href: '/elections' },
  { label: 'Get Involved', href: '/get-involved' },
  { label: 'News', href: '/news' },
  { label: 'Donate', href: '/donate' },
  { label: 'Contact', href: '/contact' },
]

export const footerNav: NavItem[] = [
  ...primaryNav,
  { label: 'Privacy Policy', href: '/privacy-policy' },
]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- nav`
Expected: `3 passed`

- [ ] **Step 5: Create `components/layout/SkipLink.tsx`**

Must be the first focusable element on the page. Visually hidden until focused.

```tsx
export function SkipLink() {
  return (
    <a
      href="#main"
      // on-navy is unconditional: the ring only renders while focused, and while
      // focused this element's own background IS navy, so the ring must be white.
      className="on-navy sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-navy focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
    >
      Skip to content
    </a>
  )
}
```

- [ ] **Step 6: Create `components/layout/MobileNav.tsx`**

A client component, because it holds open/closed state. `aria-expanded` and
`aria-controls` are required, not optional.

```tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { primaryNav } from '@/data/nav'

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded text-white"
      >
        <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}>
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      <div id="mobile-nav-panel" hidden={!open} className="on-navy absolute left-0 right-0 top-full bg-navy pb-4">
        <ul className="flex flex-col px-5">
          {primaryNav.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center border-b border-navy-700 text-base text-white"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Create `components/layout/Header.tsx`**

```tsx
import Link from 'next/link'
import { primaryNav } from '@/data/nav'
import { site } from '@/data/site'
import { MobileNav } from './MobileNav'

export function Header() {
  return (
    <header className="on-navy relative bg-navy">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-baseline gap-2 text-white">
          <span className="font-serif text-xl font-semibold tracking-tight">{site.shortName}</span>
          <span className="hidden text-xs text-white/70 lg:inline">{site.name}</span>
        </Link>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {primaryNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex min-h-11 items-center rounded px-3 text-sm font-medium text-white/90 hover:bg-navy-800 hover:text-white"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <MobileNav />
      </div>
    </header>
  )
}
```

- [ ] **Step 8: Verify the build**

Run: `npm run build`
Expected: `✓ Compiled successfully`

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add header, mobile nav and skip link"
```

---

### Task 11: Footer

**Files:**
- Create: `components/layout/Footer.tsx`

- [ ] **Step 1: Create `components/layout/Footer.tsx`**

The social links use `aria-label` because they are icon-free text abbreviations here;
keep the visible label so no icon-only link is unlabelled.

```tsx
import Link from 'next/link'
import { footerNav } from '@/data/nav'
import { site } from '@/data/site'

const SOCIAL: { label: string; href: string }[] = [
  { label: 'Instagram', href: site.social.instagram },
  { label: 'Facebook', href: site.social.facebook },
  { label: 'YouTube', href: site.social.youtube },
]

export function Footer() {
  return (
    <footer className="on-navy bg-navy px-5 py-14 text-white sm:px-8">
      <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <p className="font-serif text-lg font-semibold text-white">{site.shortName}</p>
          <p className="mt-2 max-w-xs text-sm text-white/70">{site.tagline}</p>
        </div>

        <nav aria-label="Footer">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white">Navigation</h2>
          <ul className="mt-3 space-y-1">
            {footerNav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-white/80 underline-offset-2 hover:text-white hover:underline">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-white">Contact</h2>
          <address className="mt-3 space-y-1 text-sm not-italic text-white/80">
            <p>{site.address.line1}</p>
            <p>{site.address.line2}</p>
            <p>
              <a href={site.phoneHref} className="underline-offset-2 hover:text-white hover:underline">
                {site.phone}
              </a>
            </p>
            <p>
              <a href={`mailto:${site.email}`} className="underline-offset-2 hover:text-white hover:underline">
                {site.email}
              </a>
            </p>
          </address>

          <ul className="mt-4 flex gap-4">
            {SOCIAL.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  className="text-sm text-white/80 underline-offset-2 hover:text-white hover:underline"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl border-t border-navy-700 pt-6 text-xs text-white/60">
        <p>
          &copy; {new Date().getFullYear()} {site.shortName}. All rights reserved.{' '}
          <Link href="/privacy-policy" className="underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </footer>
  )
}
```

- [ ] **Step 2: Verify the build**

Run: `npm run build`
Expected: `✓ Compiled successfully`

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add site footer"
```

---

### Task 12: Wire the layout together

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Replace `app/layout.tsx`**

`id="main"` is what the skip link targets, so it must be present and must wrap the page
content.

```tsx
import type { Metadata } from 'next'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { SkipLink } from '@/components/layout/SkipLink'
import { site } from '@/data/site'
import { inter, sourceSerif } from '@/lib/fonts'
import './globals.css'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} (${site.shortName})`,
    template: `%s | ${site.shortName}`,
  },
  description: site.mission,
  openGraph: {
    title: `${site.name} (${site.shortName})`,
    description: site.mission,
    siteName: site.shortName,
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable}`}>
      <body className="flex min-h-screen flex-col">
        <SkipLink />
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Start the dev server and check the shell renders**

```bash
npm run dev
```

Open `http://localhost:3000`. Expected: navy header with MAPAC and six nav items, the
default Next.js page body, navy footer with address and social links. Press Tab once from
page load — "Skip to content" must become visible. Resize below 768px — the nav collapses
to a hamburger that opens and closes.

Stop the dev server when done.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: wire header, footer and skip link into the root layout"
```

---
## Phase 3 — Pages

### Task 13: Home page

**Files:**
- Create: `components/home/Hero.tsx`, `components/home/PillarsRow.tsx`, `components/home/GoalsGrid.tsx`, `components/home/CtaBand.tsx`
- Modify: `app/page.tsx`

Home shows the **first six** goals (what the old home page listed); About shows all
eight. Both read `getGoals()`.

- [ ] **Step 1: Create `components/home/Hero.tsx`**

```tsx
import { Button } from '@/components/ui/Button'
import { site } from '@/data/site'

export function Hero() {
  return (
    <section className="on-navy bg-navy px-5 py-20 sm:px-8 sm:py-28">
      <div className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-white/60">
          {site.name}
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">{site.tagline}</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80">{site.mission}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/get-involved">Get involved</Button>
          <Button href="/donate" variant="ghost" className="!border-white/30 !text-white hover:!bg-white/10">
            Donate
          </Button>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Create `components/home/PillarsRow.tsx`**

```tsx
import { Card } from '@/components/ui/Card'
import { Section } from '@/components/ui/Section'
import { content } from '@/lib/content'

export async function PillarsRow() {
  const pillars = await content.getPillars()

  return (
    <Section tinted aria-labelledby="pillars-heading">
      <h2 id="pillars-heading" className="text-2xl">
        How MAPAC works
      </h2>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {pillars.map((pillar) => (
          <Card key={pillar.id}>
            <h3 className="text-lg">{pillar.title}</h3>
            <p className="mt-3 text-sm leading-relaxed">{pillar.body}</p>
          </Card>
        ))}
      </div>
    </Section>
  )
}
```

- [ ] **Step 3: Create `components/home/GoalsGrid.tsx`**

```tsx
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { content } from '@/lib/content'

export async function GoalsGrid({ limit }: { limit?: number }) {
  const all = await content.getGoals()
  const goals = typeof limit === 'number' ? all.slice(0, limit) : all

  return (
    <Section aria-labelledby="goals-heading">
      <h2 id="goals-heading" className="text-2xl">
        Our goals
      </h2>
      <ol className="mt-8 grid gap-6 sm:grid-cols-2">
        {goals.map((goal, i) => (
          <li key={goal.id} className="flex gap-4">
            <span
              aria-hidden="true"
              className="font-serif text-xl font-semibold text-crimson"
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <p className="leading-relaxed">{goal.text}</p>
          </li>
        ))}
      </ol>
      {typeof limit === 'number' && all.length > limit && (
        <div className="mt-8">
          <Button href="/about" variant="ghost">
            Read all {all.length} goals
          </Button>
        </div>
      )}
    </Section>
  )
}
```

- [ ] **Step 4: Create `components/home/CtaBand.tsx`**

```tsx
import { Button } from '@/components/ui/Button'

export function CtaBand() {
  return (
    <section className="on-navy bg-navy px-5 py-16 sm:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {/* on-navy on the section already flips --heading-color to white. */}
          <h2 className="text-2xl">Connect with us</h2>
          <p className="mt-2 max-w-md text-white/80">
            Join MAPAC as a member or sign up for our contact list to stay informed.
          </p>
        </div>
        <Button href="/get-involved">Get involved</Button>
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Replace `app/page.tsx`**

```tsx
import { CtaBand } from '@/components/home/CtaBand'
import { GoalsGrid } from '@/components/home/GoalsGrid'
import { Hero } from '@/components/home/Hero'
import { PillarsRow } from '@/components/home/PillarsRow'
import { HOME_GOAL_COUNT } from '@/data/goals'

export default function HomePage() {
  return (
    <>
      <Hero />
      <PillarsRow />
      <GoalsGrid limit={HOME_GOAL_COUNT} />
      <CtaBand />
    </>
  )
}
```

- [ ] **Step 6: Verify the build and view the page**

Run: `npm run build && npm run dev`
Open `http://localhost:3000`. Expected: navy hero with tagline and two buttons, three
pillar cards, six numbered goals with a "Read all 8 goals" button, navy CTA band.
Confirm there is no "Early Voting" banner and no events widget anywhere.

Stop the dev server.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add home page"
```

---

### Task 14: About page

**Files:**
- Create: `components/about/GovernanceSection.tsx`, `components/about/PersonCard.tsx`, `components/about/LeadershipSection.tsx`
- Create: `app/about/page.tsx`

- [ ] **Step 1: Create `components/about/PersonCard.tsx`**

```tsx
import type { Person } from '@/lib/content/types'

export function PersonCard({ person }: { person: Person }) {
  const role = person.boardRole ?? person.executiveRole

  return (
    <div className="rounded-lg border border-border-subtle bg-white p-5">
      <p className="font-serif text-base font-semibold text-navy">{person.name}</p>
      {role && <p className="mt-1 text-sm text-body">{role}</p>}
    </div>
  )
}
```

- [ ] **Step 2: Create `components/about/LeadershipSection.tsx`**

The heading carries the roster year, so a stale roster reads as dated rather than
current. That is a spec requirement, not a stylistic choice.

```tsx
import { PersonCard } from '@/components/about/PersonCard'
import { Section } from '@/components/ui/Section'
import { content } from '@/lib/content'

export async function LeadershipSection() {
  const [trustees, executive, outgoing, year] = await Promise.all([
    content.getTrustees(),
    content.getExecutiveCommittee(),
    content.getOutgoingTrustees(),
    content.getLeadershipYear(),
  ])

  return (
    <Section tinted aria-labelledby="leadership-heading">
      <h2 id="leadership-heading" className="text-2xl">
        Leadership
      </h2>

      <h3 className="mt-8 text-lg">{year} Board of Trustees</h3>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {trustees.map((person) => (
          <li key={person.id}>
            <PersonCard person={person} />
          </li>
        ))}
      </ul>

      <h3 className="mt-12 text-lg">{year} Executive Committee</h3>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {executive.map((person) => (
          <li key={person.id}>
            <div className="rounded-lg border border-border-subtle bg-white p-5">
              <p className="font-serif text-base font-semibold text-navy">{person.name}</p>
              <p className="mt-1 text-sm text-body">{person.executiveRole}</p>
            </div>
          </li>
        ))}
      </ul>

      <h3 className="mt-12 text-lg">With thanks to our outgoing trustees</h3>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed">
        MAPAC acknowledges the outgoing Trustees and honors their dedication and efforts to
        serve the Muslim community.
      </p>
      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
        {outgoing.map((person) => (
          <li key={person.id} className="text-sm text-body">
            {person.name}
          </li>
        ))}
      </ul>
    </Section>
  )
}
```

- [ ] **Step 3: Create `components/about/GovernanceSection.tsx`**

```tsx
import { Section } from '@/components/ui/Section'
import { content } from '@/lib/content'

export async function GovernanceSection() {
  const bodies = await content.getGovernanceBodies()

  return (
    <Section aria-labelledby="governance-heading">
      <h2 id="governance-heading" className="text-2xl">
        Governance
      </h2>
      <p className="mt-3 max-w-2xl leading-relaxed">
        MAPAC NC is composed of four bodies.
      </p>
      <dl className="mt-8 space-y-8">
        {bodies.map((body) => (
          <div key={body.id}>
            <dt className="font-serif text-lg font-semibold text-navy">{body.name}</dt>
            <dd className="mt-2 max-w-3xl leading-relaxed">{body.description}</dd>
          </div>
        ))}
      </dl>
    </Section>
  )
}
```

- [ ] **Step 4: Create `app/about/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { GovernanceSection } from '@/components/about/GovernanceSection'
import { LeadershipSection } from '@/components/about/LeadershipSection'
import { GoalsGrid } from '@/components/home/GoalsGrid'
import { Section } from '@/components/ui/Section'
import { site } from '@/data/site'

export const metadata: Metadata = {
  title: 'About',
  description: site.whatWeDo,
}

export default function AboutPage() {
  return (
    <>
      <Section aria-labelledby="about-heading">
        <h1 id="about-heading" className="text-3xl">
          About MAPAC
        </h1>
        <h2 className="mt-10 text-2xl">What we do</h2>
        <p className="mt-3 max-w-3xl leading-relaxed">{site.whatWeDo}</p>
      </Section>

      {/* No limit: About shows all eight goals. */}
      <GoalsGrid />

      <GovernanceSection />
      <LeadershipSection />
    </>
  )
}
```

- [ ] **Step 5: Verify the build and view the page**

Run: `npm run build && npm run dev`
Open `http://localhost:3000/about`. Expected: all **eight** goals, four governance bodies
with their bylaws text, "2025 Board of Trustees" with twelve cards, "2025 Executive
Committee" with five, and twelve outgoing trustee names.

Stop the dev server.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add about page with governance and dated leadership roster"
```

---

### Task 15: Elections page

The largest page. Per the spec's disclosure decision: condensed principles on-page, full
criteria and rubrics on-page, detailed values in the linked PDF.

**Files:**
- Create: `components/ui/Disclosure.tsx`, `components/elections/CriteriaAccordion.tsx`, `components/elections/RubricTable.tsx`, `components/elections/EndorsementsSection.tsx`
- Create: `app/elections/page.tsx`
- Test: `components/ui/Disclosure.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `components/ui/Disclosure.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- Disclosure`
Expected: FAIL — cannot resolve `./Disclosure`

- [ ] **Step 3: Create `components/ui/Disclosure.tsx`**

A real button with `aria-expanded` and `aria-controls`, per the spec's accessibility
requirements. `useId` keeps the panel id unique when many are rendered.

```tsx
'use client'

import { useId, useState, type ReactNode } from 'react'

export function Disclosure({
  summary,
  children,
  defaultOpen = false,
}: {
  summary: string
  children: ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const panelId = useId()

  return (
    <div className="border-b border-border-subtle">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-11 w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="font-serif text-lg font-semibold text-navy">{summary}</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className={`h-5 w-5 shrink-0 text-crimson transition-transform ${open ? 'rotate-45' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
      <div id={panelId} hidden={!open} className="pb-5">
        <div className="max-w-3xl leading-relaxed">{children}</div>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- Disclosure`
Expected: `3 passed`

- [ ] **Step 5: Create `components/elections/CriteriaAccordion.tsx`**

```tsx
import { Disclosure } from '@/components/ui/Disclosure'
import { content } from '@/lib/content'

export async function CriteriaAccordion() {
  const criteria = await content.getCriteria()

  return (
    <div className="mt-8 border-t border-border-subtle">
      {criteria.map((criterion, i) => (
        <Disclosure key={criterion.id} summary={`${i + 1}. ${criterion.title}`}>
          {criterion.description}
        </Disclosure>
      ))}
    </div>
  )
}
```

- [ ] **Step 6: Create `components/elections/RubricTable.tsx`**

Tables are the one thing allowed to scroll horizontally, inside their own container.

```tsx
import type { Rubric } from '@/lib/content/types'

export function RubricTable({ rubric }: { rubric: Rubric }) {
  const total = rubric.rows.reduce((sum, row) => sum + row.weight * 5, 0)

  return (
    <div>
      <h3 className="text-lg">{rubric.office}</h3>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-sm">
          <caption className="sr-only">
            Scoring rubric for {rubric.office}: weight factor and percentage points per criterion.
          </caption>
          <thead>
            <tr className="border-b border-navy text-left">
              <th scope="col" className="py-2 pr-4 font-semibold text-navy">
                Evaluation criterion
              </th>
              <th scope="col" className="py-2 pr-4 text-right font-semibold text-navy">
                Most favorable score
              </th>
              <th scope="col" className="py-2 pr-4 text-right font-semibold text-navy">
                Weight factor
              </th>
              <th scope="col" className="py-2 text-right font-semibold text-navy">
                Percentage points
              </th>
            </tr>
          </thead>
          <tbody>
            {rubric.rows.map((row) => (
              <tr key={row.criterion} className="border-b border-border-subtle">
                <th scope="row" className="py-2 pr-4 text-left font-normal">
                  {row.criterion}
                </th>
                <td className="py-2 pr-4 text-right">5</td>
                <td className="py-2 pr-4 text-right">{row.weight}</td>
                <td className="py-2 text-right">{row.weight * 5}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row" colSpan={3} className="py-2 pr-4 text-right font-semibold text-navy">
                Total possible points
              </th>
              <td className="py-2 text-right font-semibold text-navy">{total}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Create `components/elections/EndorsementsSection.tsx`**

**This component returns `null` when there are no endorsements.** That is the mechanism
preventing a stale election section. Do not add a placeholder.

```tsx
import { Section } from '@/components/ui/Section'
import { groupByCycle } from '@/data/endorsements'
import { content } from '@/lib/content'

export async function EndorsementsSection() {
  const endorsements = await content.getEndorsements()

  // No published endorsements means no section at all — not an empty state.
  if (endorsements.length === 0) return null

  const groups = groupByCycle(endorsements)

  return (
    <Section tinted aria-labelledby="endorsements-heading">
      <h2 id="endorsements-heading" className="text-2xl">
        Our endorsements
      </h2>
      {groups.map((group) => (
        <div key={group.cycle} className="mt-8">
          <h3 className="text-lg">{group.cycle}</h3>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {group.endorsements.map((e) => (
              <li key={e.id} className="rounded-lg border border-border-subtle bg-white p-5">
                <p className="font-serif text-base font-semibold text-navy">{e.candidate}</p>
                <p className="mt-1 text-sm text-body">{e.office}</p>
                {e.statementUrl && (
                  <a
                    href={e.statementUrl}
                    className="mt-3 inline-block text-sm font-medium text-crimson-deep underline"
                  >
                    Read the statement
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </Section>
  )
}
```

- [ ] **Step 8: Create `app/elections/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { CriteriaAccordion } from '@/components/elections/CriteriaAccordion'
import { EndorsementsSection } from '@/components/elections/EndorsementsSection'
import { RubricTable } from '@/components/elections/RubricTable'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import {
  DISQUALIFICATIONS,
  ENDORSEMENT_REQUIREMENT,
  GUIDE_PDF_URL,
  SCORING_SCALE,
} from '@/data/endorsement'
import { content } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Elections & Endorsements',
  description:
    'How MAPAC evaluates and endorses candidates: our principles, the eight evaluation criteria, and the weighted scoring rubrics for each level of office.',
}

export default async function ElectionsPage() {
  const [principles, rubrics] = await Promise.all([
    content.getPrinciples(),
    content.getRubrics(),
  ])

  return (
    <>
      <Section aria-labelledby="elections-heading">
        <h1 id="elections-heading" className="text-3xl">
          Elections &amp; endorsements
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed">
          MAPAC evaluates candidates based on alignment with core principles rooted in Islamic
          values and American constitutional ideals.
        </p>
        <div className="mt-6">
          <Button
            href={GUIDE_PDF_URL}
            variant="ghost"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read the full 2026 Endorsement Guide (PDF)
          </Button>
        </div>
      </Section>

      <EndorsementsSection />

      <Section tinted aria-labelledby="principles-heading">
        <h2 id="principles-heading" className="text-2xl">
          Our principles
        </h2>
        <ul className="mt-6 grid max-w-4xl gap-4 sm:grid-cols-2">
          {principles.map((p) => (
            <li key={p.id} className="flex gap-3">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-crimson" />
              <span className="leading-relaxed">{p.text}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section aria-labelledby="criteria-heading">
        <h2 id="criteria-heading" className="text-2xl">
          How we evaluate candidates
        </h2>
        <p className="mt-3 max-w-3xl leading-relaxed">
          Candidates are scored on eight criteria according to how favorably they align with
          MAPAC&rsquo;s criteria. Each criterion is scored from 1 to 5:{' '}
          {SCORING_SCALE.map((s) => `${s.score} ${s.label}`).join(', ')}.
        </p>
        <p className="mt-3 max-w-3xl leading-relaxed">{ENDORSEMENT_REQUIREMENT}</p>
        <CriteriaAccordion />
      </Section>

      <Section tinted aria-labelledby="disqualification-heading">
        <h2 id="disqualification-heading" className="text-2xl">
          Automatic disqualification
        </h2>
        <ul className="mt-6 max-w-3xl space-y-4">
          {DISQUALIFICATIONS.map((rule) => (
            <li
              key={rule.slice(0, 24)}
              className="border-l-4 border-crimson bg-white p-5 leading-relaxed"
            >
              {rule}
            </li>
          ))}
        </ul>
      </Section>

      <Section aria-labelledby="rubrics-heading">
        <h2 id="rubrics-heading" className="text-2xl">
          Scoring rubrics
        </h2>
        <p className="mt-3 max-w-3xl leading-relaxed">
          The office a candidate seeks determines which weighting scheme applies. Every rubric
          totals 100 possible points.
        </p>
        <div className="mt-10 space-y-12">
          {rubrics.map((rubric) => (
            <RubricTable key={rubric.id} rubric={rubric} />
          ))}
        </div>
      </Section>
    </>
  )
}
```

- [ ] **Step 9: Create `components/elections/OfficeGuidance.tsx`**

```tsx
import { Disclosure } from '@/components/ui/Disclosure'
import { content } from '@/lib/content'

export async function OfficeGuidance() {
  const guidance = await content.getOfficeGuidance()

  return (
    <div className="mt-8 border-t border-border-subtle">
      {guidance.map((group) => (
        <Disclosure key={group.id} summary={group.office}>
          <p>{group.intro}</p>
          {group.criteria.length > 0 && (
            <>
              <p className="mt-4 font-medium text-navy">Appropriate criteria for evaluation:</p>
              <ul className="mt-2 list-disc space-y-2 pl-6">
                {group.criteria.map((criterion) => (
                  <li key={criterion.slice(0, 32)}>{criterion}</li>
                ))}
              </ul>
            </>
          )}
        </Disclosure>
      ))}
    </div>
  )
}
```

- [ ] **Step 10: Create `components/elections/ResearchResources.tsx`**

External links get `rel="noopener noreferrer"` and open in a new tab, so a voter
mid-research does not lose the page.

```tsx
import { Card } from '@/components/ui/Card'
import { content } from '@/lib/content'

export async function ResearchResources() {
  const categories = await content.getResearchCategories()

  return (
    <ol className="mt-8 grid gap-5 md:grid-cols-2">
      {categories.map((category, i) => (
        <li key={category.id}>
          <Card className="h-full">
            <h3 className="text-base">
              <span aria-hidden="true" className="mr-2 font-serif text-crimson">
                {String(i + 1).padStart(2, '0')}
              </span>
              {category.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed">{category.description}</p>
            {category.links.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
                {category.links.map((link) => (
                  <li key={link.label}>
                    {link.url ? (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-crimson-deep underline"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <span className="text-sm">{link.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </li>
      ))}
    </ol>
  )
}
```

- [ ] **Step 11: Add both sections to `app/elections/page.tsx`**

Add the imports:

```tsx
import { OfficeGuidance } from '@/components/elections/OfficeGuidance'
import { ResearchResources } from '@/components/elections/ResearchResources'
```

Then, immediately after the closing `</Section>` of the "Scoring rubrics" section and
before the final `</>`, insert:

```tsx
      <Section tinted aria-labelledby="office-guidance-heading">
        <h2 id="office-guidance-heading" className="text-2xl">
          What we look for at each level of office
        </h2>
        <p className="mt-3 max-w-3xl leading-relaxed">
          Qualifications and policy criteria differ by the office a candidate seeks. These notes
          explain what MAPAC weighs at each level.
        </p>
        <OfficeGuidance />
      </Section>

      <Section aria-labelledby="research-heading">
        <h2 id="research-heading" className="text-2xl">
          Researching candidates yourself
        </h2>
        <p className="mt-3 max-w-3xl leading-relaxed">
          You do not have to take anyone&rsquo;s word for it. These are the tools MAPAC uses to
          research candidates&rsquo; backgrounds, policies, and public records.
        </p>
        <ResearchResources />
      </Section>
```


- [ ] **Step 12: Verify the build and view the page**

Run: `npm run build && npm run dev`
Open `http://localhost:3000/elections`. Expected: ten principles, eight collapsed
criteria that expand on click and on Enter/Space, two disqualification rules, five rubric
tables each totalling 100, five office-guidance disclosures, ten research-resource cards,
**and no endorsements section at all**.

Stop the dev server.

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "feat: add elections page with criteria, rubrics and conditional endorsements"
```

---
### Task 16: News index and post pages

**Files:**
- Create: `app/news/page.tsx`, `app/news/[slug]/page.tsx`, `lib/formatDate.ts`
- Test: `lib/formatDate.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/formatDate.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { formatDate } from './formatDate'

describe('formatDate', () => {
  it('formats an ISO date as a long US date', () => {
    expect(formatDate('2026-02-14')).toBe('February 14, 2026')
  })

  it('does not shift the day across timezones', () => {
    // Parsing "2026-01-01" as UTC then formatting in a negative-offset zone would
    // yield December 31. It must not.
    expect(formatDate('2026-01-01')).toBe('January 1, 2026')
  })

  it('returns the raw value unchanged when it is not a valid date', () => {
    expect(formatDate('not-a-date')).toBe('not-a-date')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- formatDate`
Expected: FAIL — cannot resolve `./formatDate`

- [ ] **Step 3: Create `lib/formatDate.ts`**

Constructing the Date from explicit parts avoids the UTC-parsing timezone shift that
`new Date('2026-01-01')` causes.

```ts
const FORMATTER = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

/** Formats a YYYY-MM-DD string. Returns the input unchanged if it cannot be parsed. */
export function formatDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!match) return iso

  const [, year, month, day] = match
  const date = new Date(Number(year), Number(month) - 1, Number(day))
  if (Number.isNaN(date.getTime())) return iso

  return FORMATTER.format(date)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- formatDate`
Expected: `3 passed`

- [ ] **Step 5: Create `app/news/page.tsx`**

The empty state here is legitimate: this page's whole purpose is the list, so it must say
something. That is different from the Elections endorsements section, which is one section
among many and therefore disappears entirely.

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { Section } from '@/components/ui/Section'
import { site } from '@/data/site'
import { content } from '@/lib/content'
import { formatDate } from '@/lib/formatDate'

export const metadata: Metadata = {
  title: 'News & Press Releases',
  description: 'Statements and press releases from the Muslim American Public Affairs Council.',
}

export default async function NewsPage() {
  const posts = await content.getNews()

  return (
    <Section aria-labelledby="news-heading">
      <h1 id="news-heading" className="text-3xl">
        News &amp; press releases
      </h1>

      {posts.length === 0 ? (
        <div className="mt-8 max-w-2xl rounded-lg border border-border-subtle bg-surface p-8">
          <p className="leading-relaxed">
            MAPAC statements and press releases will be published here. To be notified when we
            publish,{' '}
            <Link href="/get-involved" className="font-medium text-crimson-deep underline">
              join our contact list
            </Link>
            , or reach us at{' '}
            <a href={`mailto:${site.email}`} className="font-medium text-crimson-deep underline">
              {site.email}
            </a>
            .
          </p>
        </div>
      ) : (
        <ul className="mt-10 divide-y divide-border-subtle border-t border-border-subtle">
          {posts.map((post) => (
            <li key={post.slug} className="py-6">
              <p className="text-sm text-body">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
              </p>
              <h2 className="mt-1 text-xl">
                <Link href={`/news/${post.slug}`} className="hover:text-crimson-deep hover:underline">
                  {post.title}
                </Link>
              </h2>
              {post.summary && <p className="mt-2 max-w-2xl leading-relaxed">{post.summary}</p>}
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
```

- [ ] **Step 6: Create `app/news/[slug]/page.tsx`**

```tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { Prose } from '@/components/ui/Prose'
import { Section } from '@/components/ui/Section'
import { content } from '@/lib/content'
import { formatDate } from '@/lib/formatDate'

type Params = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const posts = await content.getNews()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const post = await content.getNewsBySlug(slug)
  if (!post) return { title: 'Not found' }
  return { title: post.title, description: post.summary }
}

export default async function NewsPostPage({ params }: Params) {
  const { slug } = await params
  const post = await content.getNewsBySlug(slug)
  if (!post) notFound()

  return (
    <Section>
      <p className="text-sm text-body">
        <Link href="/news" className="font-medium text-crimson-deep underline">
          News &amp; press releases
        </Link>
      </p>
      <h1 className="mt-4 max-w-3xl text-3xl">{post.title}</h1>
      <p className="mt-3 text-sm text-body">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
      </p>
      <Prose className="mt-8">{post.body ? <MDXRemote source={post.body} /> : null}</Prose>
    </Section>
  )
}
```

- [ ] **Step 7: Verify the build handles zero posts**

Run: `npm run build`
Expected: `✓ Compiled successfully`. `generateStaticParams` returning an empty array is
valid; the route simply produces no static pages.

- [ ] **Step 8: Verify a post renders, then remove the test post**

```bash
cat > content/news/plan-smoke-test.mdx <<'MDX'
---
title: Plan Smoke Test
date: 2026-09-25
summary: Temporary post to verify MDX rendering. Delete after checking.
---

This is a **test** body with a [link](https://mapacnc.com).
MDX
npm run dev
```

Open `http://localhost:3000/news`. Expected: the post is listed with "September 25, 2026".
Click it: the body renders with a bold word and an underlined crimson link.

Stop the dev server, then delete the test post:

```bash
rm content/news/plan-smoke-test.mdx
```

Reload `/news` after restarting dev: expected the empty-state card.

- [ ] **Step 9: Confirm no test post is committed**

Run: `ls content/news/`
Expected: only `.gitkeep`

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: add news index and post pages with empty-state handling"
```

---

### Task 17: Contact page

**Files:**
- Create: `app/contact/page.tsx`

- [ ] **Step 1: Create `app/contact/page.tsx`**

The volunteer form is added to this page in Task 24, once the form component exists.

```tsx
import type { Metadata } from 'next'
import { Section } from '@/components/ui/Section'
import { site } from '@/data/site'

export const metadata: Metadata = {
  title: 'Contact',
  description: `Reach MAPAC by mail, phone or email. ${site.address.line1}, ${site.address.line2}.`,
}

const SOCIAL = [
  { label: 'Instagram', href: site.social.instagram },
  { label: 'Facebook', href: site.social.facebook },
  { label: 'YouTube', href: site.social.youtube },
]

export default function ContactPage() {
  return (
    <Section aria-labelledby="contact-heading">
      <h1 id="contact-heading" className="text-3xl">
        Contact MAPAC
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed">
        Have questions or want to learn more about MAPAC? Reach out using the details below.
        We&rsquo;re here to listen, support, and collaborate with you.
      </p>

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        <div>
          <h2 className="text-lg">By mail</h2>
          <address className="mt-2 not-italic leading-relaxed">
            {site.address.line1}
            <br />
            {site.address.line2}
          </address>
          <a
            href={site.address.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm font-medium text-crimson-deep underline"
          >
            View on Google Maps
          </a>
        </div>

        <div>
          <h2 className="text-lg">By phone and email</h2>
          <p className="mt-2 leading-relaxed">
            <a href={site.phoneHref} className="font-medium text-crimson-deep underline">
              {site.phone}
            </a>
            <br />
            <a href={`mailto:${site.email}`} className="font-medium text-crimson-deep underline">
              {site.email}
            </a>
          </p>
        </div>

        <div className="sm:col-span-2">
          <h2 className="text-lg">Follow MAPAC</h2>
          <ul className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
            {SOCIAL.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-crimson-deep underline"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  )
}
```

- [ ] **Step 2: Verify the build**

Run: `npm run build`
Expected: `✓ Compiled successfully`

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add contact page"
```

---

### Task 18: Privacy policy, 404 and error pages

**Files:**
- Create: `app/privacy-policy/page.tsx`, `app/not-found.tsx`, `app/error.tsx`

- [ ] **Step 1: Create `app/privacy-policy/page.tsx`**

The old site's privacy policy text was not captured, so this states only what the new
site actually does — which is accurate and verifiable. Flag it for MAPAC to replace with
their reviewed policy if they have one.

```tsx
import type { Metadata } from 'next'
import { Prose } from '@/components/ui/Prose'
import { Section } from '@/components/ui/Section'
import { site } from '@/data/site'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How MAPAC handles information collected through this website.',
}

export default function PrivacyPolicyPage() {
  return (
    <Section>
      <h1 className="text-3xl">Privacy policy</h1>
      <Prose className="mt-8">
        <h2>Information we collect</h2>
        <p>
          MAPAC collects information you choose to give us through this website. That means the
          name and email address you enter when joining our contact list, and the name, email
          address, and any message you enter when you contact us or volunteer.
        </p>

        <h2>How we use it</h2>
        <p>
          We use your contact details to send you MAPAC news and updates and to respond to what
          you wrote to us. We do not sell your information, and we do not share it with third
          parties except the service providers who deliver our email and process our donations on
          our behalf.
        </p>

        <h2>Donations</h2>
        <p>
          Donations are processed by Stripe. Your card details are entered on Stripe&rsquo;s own
          secure pages and are never received or stored by MAPAC or by this website.
        </p>

        <h2>Unsubscribing and removal</h2>
        <p>
          Every email we send includes an unsubscribe link. To have your information removed
          entirely, email us at <a href={`mailto:${site.email}`}>{site.email}</a> and we will
          delete it.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy can be sent to{' '}
          <a href={`mailto:${site.email}`}>{site.email}</a>, or by mail to {site.address.line1},{' '}
          {site.address.line2}.
        </p>
      </Prose>
    </Section>
  )
}
```

- [ ] **Step 2: Create `app/not-found.tsx`**

```tsx
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'

export default function NotFound() {
  return (
    <Section>
      <p className="font-serif text-sm font-semibold uppercase tracking-widest text-crimson">
        404
      </p>
      <h1 className="mt-3 text-3xl">We couldn&rsquo;t find that page</h1>
      <p className="mt-4 max-w-xl leading-relaxed">
        The page may have moved, or the link may be out of date.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/">Go to the home page</Button>
        <Button href="/contact" variant="ghost">
          Contact MAPAC
        </Button>
      </div>
    </Section>
  )
}
```

- [ ] **Step 3: Create `app/error.tsx`**

Must be a client component, and must accept `reset`.

```tsx
'use client'

import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <Section>
      <h1 className="text-3xl">Something went wrong</h1>
      <p className="mt-4 max-w-xl leading-relaxed">
        An unexpected error occurred while loading this page. Please try again.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button href="/" variant="ghost">
          Go to the home page
        </Button>
      </div>
    </Section>
  )
}
```

- [ ] **Step 4: Verify the build and check the 404**

Run: `npm run build && npm run dev`
Open `http://localhost:3000/does-not-exist`. Expected: the branded 404 inside the normal
header and footer.

Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add privacy policy, 404 and error pages"
```

---
## Phase 4 — Forms

### Task 19: Validation schemas

**Files:**
- Create: `lib/validation.ts`
- Test: `lib/validation.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/validation.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { newsletterSchema, getInvolvedSchema } from './validation'

describe('newsletterSchema', () => {
  it('accepts a valid signup', () => {
    const result = newsletterSchema.safeParse({ name: 'Aisha', email: 'a@example.com', botField: '' })
    expect(result.success).toBe(true)
  })

  it('rejects a malformed email', () => {
    const result = newsletterSchema.safeParse({ name: 'Aisha', email: 'nope', botField: '' })
    expect(result.success).toBe(false)
  })

  it('rejects an empty name', () => {
    const result = newsletterSchema.safeParse({ name: '  ', email: 'a@example.com', botField: '' })
    expect(result.success).toBe(false)
  })

  it('rejects a filled honeypot, which only a bot would fill', () => {
    const result = newsletterSchema.safeParse({
      name: 'Aisha',
      email: 'a@example.com',
      botField: 'http://spam.example',
    })
    expect(result.success).toBe(false)
  })

  it('treats a missing honeypot as empty, since real browsers may omit it', () => {
    const result = newsletterSchema.safeParse({ name: 'Aisha', email: 'a@example.com' })
    expect(result.success).toBe(true)
  })

  it('trims surrounding whitespace from the email', () => {
    const result = newsletterSchema.safeParse({ name: 'Aisha', email: '  a@example.com ' })
    expect(result.success && result.data.email).toBe('a@example.com')
  })

  it('rejects an absurdly long name rather than emailing it onward', () => {
    const result = newsletterSchema.safeParse({ name: 'x'.repeat(300), email: 'a@example.com' })
    expect(result.success).toBe(false)
  })
})

describe('getInvolvedSchema', () => {
  it('accepts a full submission', () => {
    const result = getInvolvedSchema.safeParse({
      name: 'Aisha',
      email: 'a@example.com',
      phone: '(984) 254-7441',
      interest: 'membership',
      message: 'I would like to join.',
    })
    expect(result.success).toBe(true)
  })

  it('accepts a submission with no phone and no message', () => {
    const result = getInvolvedSchema.safeParse({
      name: 'Aisha',
      email: 'a@example.com',
      interest: 'volunteer',
    })
    expect(result.success).toBe(true)
  })

  it('rejects an interest outside the allowed set', () => {
    const result = getInvolvedSchema.safeParse({
      name: 'Aisha',
      email: 'a@example.com',
      interest: 'something-else',
    })
    expect(result.success).toBe(false)
  })

  it('rejects a message long enough to be an abuse vector', () => {
    const result = getInvolvedSchema.safeParse({
      name: 'Aisha',
      email: 'a@example.com',
      interest: 'volunteer',
      message: 'x'.repeat(5001),
    })
    expect(result.success).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- validation`
Expected: FAIL — cannot resolve `./validation`

- [ ] **Step 3: Create `lib/validation.ts`**

```ts
import { z } from 'zod'

/**
 * Hidden field. Real users never see it, so a non-empty value means a bot.
 * Optional because a browser may omit an empty input entirely.
 */
const honeypot = z
  .string()
  .max(0, 'This submission looks automated.')
  .optional()
  .or(z.literal(''))

const name = z.string().trim().min(1, 'Please enter your name.').max(200, 'That name is too long.')

const email = z
  .string()
  .trim()
  .min(1, 'Please enter your email address.')
  .max(320, 'That email address is too long.')
  .email('Please enter a valid email address.')

export const INTERESTS = ['membership', 'volunteer', 'newsletter', 'other'] as const

export const newsletterSchema = z.object({
  name,
  email,
  botField: honeypot,
})

export const getInvolvedSchema = z.object({
  name,
  email,
  phone: z.string().trim().max(40, 'That phone number is too long.').optional(),
  interest: z.enum(INTERESTS, { message: 'Please choose how you would like to get involved.' }),
  message: z.string().trim().max(5000, 'Please keep your message under 5000 characters.').optional(),
  botField: honeypot,
})

export type NewsletterInput = z.infer<typeof newsletterSchema>
export type GetInvolvedInput = z.infer<typeof getInvolvedSchema>

/** Flattens a zod error into `{ fieldName: firstMessage }` for rendering under inputs. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form')
    if (!out[key]) out[key] = issue.message
  }
  return out
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- validation`
Expected: `11 passed`

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add shared zod validation for newsletter and get-involved forms"
```

---

### Task 20: Rate limiting

An in-memory limiter, which is the right scope here: it stops casual abuse from a single
address without adding a Redis dependency to a brochure site. Note honestly in the code
that it resets on redeploy and is per-instance.

**Files:**
- Create: `lib/rate-limit.ts`
- Test: `lib/rate-limit.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/rate-limit.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { checkRateLimit, __resetRateLimit } from './rate-limit'

describe('checkRateLimit', () => {
  beforeEach(() => {
    __resetRateLimit()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('allows requests up to the limit', () => {
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit('1.2.3.4', { limit: 5, windowMs: 60_000 }).ok).toBe(true)
    }
  })

  it('blocks the request after the limit is exceeded', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('1.2.3.4', { limit: 5, windowMs: 60_000 })
    expect(checkRateLimit('1.2.3.4', { limit: 5, windowMs: 60_000 }).ok).toBe(false)
  })

  it('tracks each key independently', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('1.2.3.4', { limit: 5, windowMs: 60_000 })
    expect(checkRateLimit('5.6.7.8', { limit: 5, windowMs: 60_000 }).ok).toBe(true)
  })

  it('allows again once the window has elapsed', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('1.2.3.4', { limit: 5, windowMs: 60_000 })
    expect(checkRateLimit('1.2.3.4', { limit: 5, windowMs: 60_000 }).ok).toBe(false)
    vi.advanceTimersByTime(60_001)
    expect(checkRateLimit('1.2.3.4', { limit: 5, windowMs: 60_000 }).ok).toBe(true)
  })

  it('reports how many seconds to wait when blocked', () => {
    for (let i = 0; i < 5; i++) checkRateLimit('1.2.3.4', { limit: 5, windowMs: 60_000 })
    const result = checkRateLimit('1.2.3.4', { limit: 5, windowMs: 60_000 })
    expect(result.ok).toBe(false)
    expect(result.retryAfterSeconds).toBeGreaterThan(0)
    expect(result.retryAfterSeconds).toBeLessThanOrEqual(60)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- rate-limit`
Expected: FAIL — cannot resolve `./rate-limit`

- [ ] **Step 3: Create `lib/rate-limit.ts`**

```ts
type Options = {
  limit: number
  windowMs: number
}

type Result = {
  ok: boolean
  retryAfterSeconds: number
}

type Entry = {
  count: number
  resetAt: number
}

/**
 * Per-instance, in-memory fixed-window limiter. It resets on redeploy and is not shared
 * between serverless instances, which is acceptable here: it exists to stop casual abuse
 * of the contact forms, not to enforce a billing quota.
 */
const buckets = new Map<string, Entry>()

/** Test-only hook. */
export function __resetRateLimit() {
  buckets.clear()
}

export function checkRateLimit(key: string, { limit, windowMs }: Options): Result {
  const now = Date.now()
  const entry = buckets.get(key)

  if (!entry || now >= entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, retryAfterSeconds: 0 }
  }

  if (entry.count >= limit) {
    return { ok: false, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) }
  }

  entry.count += 1
  return { ok: true, retryAfterSeconds: 0 }
}

/** Best-effort client IP from proxy headers, falling back to a shared bucket. */
export function clientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0]!.trim()
  return headers.get('x-real-ip') ?? 'unknown'
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- rate-limit`
Expected: `5 passed`

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add in-memory rate limiter for form routes"
```

---

### Task 21: Email sending with graceful degradation

This is where the spec's "missing env vars degrade, never crash" rule is implemented for
forms. `isEmailConfigured()` is what the UI reads to decide whether to render a form or a
`mailto:` link.

**Files:**
- Create: `lib/email.ts`
- Test: `lib/email.test.ts`

- [ ] **Step 1: Install Resend**

```bash
npm install resend
```

- [ ] **Step 2: Write the failing test**

Create `lib/email.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

const ORIGINAL_ENV = { ...process.env }

describe('email configuration', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  it('reports unconfigured when RESEND_API_KEY is absent', async () => {
    delete process.env.RESEND_API_KEY
    const { isEmailConfigured } = await import('./email')
    expect(isEmailConfigured()).toBe(false)
  })

  it('reports configured when RESEND_API_KEY is present', async () => {
    process.env.RESEND_API_KEY = 're_test_key'
    const { isEmailConfigured } = await import('./email')
    expect(isEmailConfigured()).toBe(true)
  })

  it('refuses to send when unconfigured, rather than throwing', async () => {
    delete process.env.RESEND_API_KEY
    const { sendNotification } = await import('./email')
    const result = await sendNotification({ subject: 'S', text: 'T' })
    expect(result.sent).toBe(false)
    expect(result.reason).toMatch(/not configured/i)
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- email`
Expected: FAIL — cannot resolve `./email`

- [ ] **Step 4: Create `lib/email.ts`**

```ts
import { Resend } from 'resend'

/** Resend's shared sender, usable before MAPAC verifies its own domain. */
const FROM = 'MAPAC Website <onboarding@resend.dev>'

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY)
}

export function notificationRecipient(): string {
  return process.env.CONTACT_TO_EMAIL ?? 'mail@mapacnc.com'
}

export type SendResult = {
  sent: boolean
  reason?: string
}

/**
 * Sends a plain-text notification to MAPAC. Never throws: a form submission must not
 * return a 500 because an email provider is unconfigured or temporarily down.
 */
export async function sendNotification({
  subject,
  text,
  replyTo,
}: {
  subject: string
  text: string
  replyTo?: string
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return { sent: false, reason: 'Email is not configured (RESEND_API_KEY is unset).' }
  }

  try {
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from: FROM,
      to: notificationRecipient(),
      subject,
      text,
      ...(replyTo ? { replyTo } : {}),
    })

    if (error) {
      console.error('[email] Resend returned an error:', error)
      return { sent: false, reason: 'The email provider rejected the message.' }
    }

    return { sent: true }
  } catch (cause) {
    console.error('[email] Unexpected failure sending notification:', cause)
    return { sent: false, reason: 'The email provider could not be reached.' }
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- email`
Expected: `3 passed`

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add Resend email helper that degrades instead of throwing"
```

---

### Task 22: Form API routes

**Files:**
- Create: `app/api/newsletter/route.ts`, `app/api/get-involved/route.ts`
- Test: `app/api/routes.test.ts`

- [ ] **Step 1: Write the failing test**

Create `app/api/routes.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { __resetRateLimit } from '@/lib/rate-limit'

vi.mock('@/lib/email', () => ({
  isEmailConfigured: () => true,
  notificationRecipient: () => 'mail@mapacnc.com',
  sendNotification: vi.fn(async () => ({ sent: true })),
}))

function post(body: unknown, ip = '1.2.3.4') {
  return new Request('http://localhost/api/newsletter', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify(body),
  })
}

describe('POST /api/newsletter', () => {
  beforeEach(() => {
    __resetRateLimit()
  })

  it('accepts a valid signup', async () => {
    const { POST } = await import('./newsletter/route')
    const res = await POST(post({ name: 'Aisha', email: 'a@example.com' }))
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({ ok: true })
  })

  it('returns 400 with field errors for an invalid email', async () => {
    const { POST } = await import('./newsletter/route')
    const res = await POST(post({ name: 'Aisha', email: 'nope' }))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.ok).toBe(false)
    expect(body.errors.email).toBeTruthy()
  })

  it('returns 400 for malformed JSON rather than throwing', async () => {
    const { POST } = await import('./newsletter/route')
    const res = await POST(
      new Request('http://localhost/api/newsletter', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-forwarded-for': '9.9.9.9' },
        body: '{not json',
      }),
    )
    expect(res.status).toBe(400)
  })

  it('silently accepts a filled honeypot without emailing, so bots learn nothing', async () => {
    const email = await import('@/lib/email')
    const { POST } = await import('./newsletter/route')
    const before = vi.mocked(email.sendNotification).mock.calls.length
    const res = await POST(post({ name: 'Bot', email: 'b@example.com', botField: 'spam' }))
    expect(res.status).toBe(200)
    expect(vi.mocked(email.sendNotification).mock.calls.length).toBe(before)
  })

  it('rate limits after five submissions from one address', async () => {
    const { POST } = await import('./newsletter/route')
    for (let i = 0; i < 5; i++) {
      await POST(post({ name: 'Aisha', email: 'a@example.com' }, '7.7.7.7'))
    }
    const res = await POST(post({ name: 'Aisha', email: 'a@example.com' }, '7.7.7.7'))
    expect(res.status).toBe(429)
    expect(res.headers.get('retry-after')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- routes`
Expected: FAIL — cannot resolve `./newsletter/route`

- [ ] **Step 3: Create `app/api/newsletter/route.ts`**

Note the honeypot behaviour: a bot gets a 200 and nothing is sent. Returning an error
would tell the bot its trick was detected.

```ts
import { NextResponse } from 'next/server'
import { sendNotification } from '@/lib/email'
import { checkRateLimit, clientIp } from '@/lib/rate-limit'
import { fieldErrors, newsletterSchema } from '@/lib/validation'

export const runtime = 'nodejs'

const RATE = { limit: 5, windowMs: 60_000 }

export async function POST(request: Request) {
  const ip = clientIp(request.headers)
  const rate = checkRateLimit(`newsletter:${ip}`, RATE)
  if (!rate.ok) {
    return NextResponse.json(
      { ok: false, message: 'Too many submissions. Please try again shortly.' },
      { status: 429, headers: { 'retry-after': String(rate.retryAfterSeconds) } },
    )
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid request.' }, { status: 400 })
  }

  const parsed = newsletterSchema.safeParse(payload)
  if (!parsed.success) {
    const errors = fieldErrors(parsed.error)
    // A filled honeypot is a bot. Return success and do nothing.
    if (errors.botField) {
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ ok: false, errors }, { status: 400 })
  }

  const { name, email } = parsed.data
  const result = await sendNotification({
    subject: `Newsletter signup: ${name}`,
    text: `A new newsletter signup from the MAPAC website.\n\nName: ${name}\nEmail: ${email}\n`,
    replyTo: email,
  })

  if (!result.sent) {
    console.warn('[newsletter] signup not delivered:', result.reason, { email })
    return NextResponse.json(
      {
        ok: false,
        message:
          'We could not record your signup automatically. Please email mail@mapacnc.com and we will add you.',
      },
      { status: 503 },
    )
  }

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 4: Create `app/api/get-involved/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { sendNotification } from '@/lib/email'
import { checkRateLimit, clientIp } from '@/lib/rate-limit'
import { fieldErrors, getInvolvedSchema } from '@/lib/validation'

export const runtime = 'nodejs'

const RATE = { limit: 5, windowMs: 60_000 }

const INTEREST_LABELS: Record<string, string> = {
  membership: 'Becoming a member',
  volunteer: 'Volunteering',
  newsletter: 'Joining the contact list',
  other: 'Something else',
}

export async function POST(request: Request) {
  const ip = clientIp(request.headers)
  const rate = checkRateLimit(`get-involved:${ip}`, RATE)
  if (!rate.ok) {
    return NextResponse.json(
      { ok: false, message: 'Too many submissions. Please try again shortly.' },
      { status: 429, headers: { 'retry-after': String(rate.retryAfterSeconds) } },
    )
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'Invalid request.' }, { status: 400 })
  }

  const parsed = getInvolvedSchema.safeParse(payload)
  if (!parsed.success) {
    const errors = fieldErrors(parsed.error)
    if (errors.botField) {
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ ok: false, errors }, { status: 400 })
  }

  const { name, email, phone, interest, message } = parsed.data
  const lines = [
    'A new Get Involved submission from the MAPAC website.',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || '(not given)'}`,
    `Interest: ${INTEREST_LABELS[interest] ?? interest}`,
    '',
    'Message:',
    message || '(none)',
    '',
  ]

  const result = await sendNotification({
    subject: `Get Involved: ${name} — ${INTEREST_LABELS[interest] ?? interest}`,
    text: lines.join('\n'),
    replyTo: email,
  })

  if (!result.sent) {
    console.warn('[get-involved] submission not delivered:', result.reason, { email })
    return NextResponse.json(
      {
        ok: false,
        message:
          'We could not send your message automatically. Please email mail@mapacnc.com or call (984) 254-7441.',
      },
      { status: 503 },
    )
  }

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- routes`
Expected: `5 passed`

- [ ] **Step 6: Run the full suite**

Run: `npm test`
Expected: all tests pass

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add newsletter and get-involved API routes"
```

---
### Task 23: Form components

**Files:**
- Create: `components/ui/Field.tsx`, `components/forms/NewsletterForm.tsx`, `components/forms/GetInvolvedForm.tsx`
- Test: `components/forms/NewsletterForm.test.tsx`

- [ ] **Step 1: Create `components/ui/Field.tsx`**

Every field gets a real `<label>` tied by `htmlFor`, and errors are tied to the input by
`aria-describedby` so a screen reader announces them.

```tsx
import type { ReactNode } from 'react'

export function Field({
  id,
  label,
  error,
  hint,
  required = false,
  children,
}: {
  id: string
  label: string
  error?: string
  hint?: string
  required?: boolean
  children: (props: { id: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }) => ReactNode
}) {
  const errorId = error ? `${id}-error` : undefined
  const hintId = hint ? `${id}-hint` : undefined
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-navy">
        {label}
        {required && (
          <>
            {' '}
            <span className="text-crimson-deep" aria-hidden="true">
              *
            </span>
            <span className="sr-only">(required)</span>
          </>
        )}
      </label>
      {hint && (
        <p id={hintId} className="mt-1 text-xs text-body">
          {hint}
        </p>
      )}
      <div className="mt-1.5">
        {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })}
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-sm font-medium text-crimson-deep">
          {error}
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Write the failing test**

Create `components/forms/NewsletterForm.test.tsx`:

```tsx
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
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- NewsletterForm`
Expected: FAIL — cannot resolve `./NewsletterForm`

- [ ] **Step 4: Create `components/forms/NewsletterForm.tsx`**

```tsx
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
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- NewsletterForm`
Expected: `4 passed`

- [ ] **Step 6: Create `components/forms/GetInvolvedForm.tsx`**

```tsx
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
          <a href={`mailto:${site.email}`} className="font-medium text-crimson-deep underline">
            {site.email}
          </a>
          <br />
          <a href={site.phoneHref} className="font-medium text-crimson-deep underline">
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
```

- [ ] **Step 7: Run the full suite and build**

Run: `npm test && npm run build`
Expected: all tests pass, build compiles

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add accessible newsletter and get-involved form components"
```

---

### Task 24: Get Involved page, and the form on Contact

This page fixes the old membership page, which asked people to join without saying what
membership meant. The substance comes from the bylaws text already in
`data/governance.ts`.

**Files:**
- Create: `app/get-involved/page.tsx`
- Modify: `app/contact/page.tsx`

- [ ] **Step 1: Create `app/get-involved/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { GetInvolvedForm } from '@/components/forms/GetInvolvedForm'
import { NewsletterForm } from '@/components/forms/NewsletterForm'
import { Card } from '@/components/ui/Card'
import { Section } from '@/components/ui/Section'
import { isEmailConfigured } from '@/lib/email'

export const metadata: Metadata = {
  title: 'Get Involved',
  description:
    'Become a MAPAC voting or associate member, volunteer on a committee, or join our contact list.',
}

const MEMBERSHIP = [
  {
    id: 'voting',
    title: 'Voting members',
    body: 'Paid members who agree to the constitution and By Laws, have paid their dues, and maintain their membership as required. Voting members elect the Board of Trustees and are eligible to serve on the Board and the Executive Committee.',
  },
  {
    id: 'associate',
    title: 'Associate members',
    body: 'Non-Muslim members of the community are welcome to join. Associate members are exempt from voting and are not eligible for Board or Executive Committee membership, but enjoy all other benefits of membership, including discounted entry to events and free entry to educational events upon availability.',
  },
]

export default function GetInvolvedPage() {
  const configured = isEmailConfigured()

  return (
    <>
      <Section aria-labelledby="get-involved-heading">
        <h1 id="get-involved-heading" className="text-3xl">
          Get involved
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed">
          MAPAC&rsquo;s work depends on the community it represents. Join as a member, volunteer on
          a committee, or sign up for our contact list to stay informed.
        </p>
      </Section>

      <Section tinted aria-labelledby="membership-heading">
        <h2 id="membership-heading" className="text-2xl">
          Membership
        </h2>
        <p className="mt-3 max-w-3xl leading-relaxed">
          MAPAC&rsquo;s General Body is made up of two groups.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {MEMBERSHIP.map((tier) => (
            <Card key={tier.id}>
              <h3 className="text-lg">{tier.title}</h3>
              <p className="mt-3 text-sm leading-relaxed">{tier.body}</p>
            </Card>
          ))}
        </div>
        <p className="mt-6 max-w-3xl text-sm leading-relaxed">
          Dues and current membership terms are set by the By Laws. Send the form below and MAPAC
          will confirm the current rate and how to pay.
        </p>
      </Section>

      <Section aria-labelledby="volunteer-heading">
        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 id="volunteer-heading" className="text-2xl">
              Join or volunteer
            </h2>
            <p className="mt-3 leading-relaxed">
              Tell us how you&rsquo;d like to take part and a member of MAPAC will get back to you.
            </p>
            <div className="mt-6">
              <GetInvolvedForm configured={configured} />
            </div>
          </div>

          <div>
            <h2 className="text-2xl">Join our contact list</h2>
            <p className="mt-3 leading-relaxed">
              Get MAPAC news, statements, and election information by email.
            </p>
            <div className="mt-6">
              <NewsletterForm configured={configured} />
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}
```

- [ ] **Step 2: Add the form to `app/contact/page.tsx`**

Add these imports at the top of the file:

```tsx
import { GetInvolvedForm } from '@/components/forms/GetInvolvedForm'
import { isEmailConfigured } from '@/lib/email'
```

Change the component signature to read the config, replacing
`export default function ContactPage() {` with:

```tsx
export default function ContactPage() {
  const configured = isEmailConfigured()
```

Then, immediately before the final `</Section>`, insert:

```tsx
        <div className="sm:col-span-2">
          <h2 className="text-lg">Send us a message</h2>
          <div className="mt-4 max-w-xl">
            <GetInvolvedForm configured={configured} />
          </div>
        </div>
```

- [ ] **Step 3: Verify the degraded path, which is the default until keys exist**

Run: `npm run build && npm run dev`

With no `RESEND_API_KEY` set, open `http://localhost:3000/get-involved`. Expected: both
form slots show contact details instead of inputs, and **nothing is broken or blank**.
This is the deploy-before-credentials state the spec requires.

- [ ] **Step 4: Verify the configured path**

Create `.env.local` with a placeholder and restart the dev server:

```bash
echo 'RESEND_API_KEY=re_placeholder_not_a_real_key' > .env.local
npm run dev
```

Expected: real forms render on `/get-involved` and `/contact`. Submitting returns the
503 fallback message naming `mail@mapacnc.com`, because the key is not real — that is the
correct behaviour, not a bug.

Stop the dev server and remove the placeholder:

```bash
rm .env.local
```

- [ ] **Step 5: Confirm `.env.local` is not tracked**

Run: `git status --porcelain`
Expected: no line mentioning `.env.local`

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add get involved page and contact form"
```

---
## Phase 5 — Donations

### Task 25: Donation amount validation

The client sends an amount; the server must never trust it. This task builds and tests
that boundary before any Stripe code exists.

**Files:**
- Create: `lib/donation.ts`
- Test: `lib/donation.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/donation.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { PRESET_AMOUNTS, MIN_CENTS, MAX_CENTS, parseAmountToCents } from './donation'

describe('PRESET_AMOUNTS', () => {
  it('are all within the allowed range', () => {
    for (const dollars of PRESET_AMOUNTS) {
      const cents = dollars * 100
      expect(cents).toBeGreaterThanOrEqual(MIN_CENTS)
      expect(cents).toBeLessThanOrEqual(MAX_CENTS)
    }
  })
})

describe('parseAmountToCents', () => {
  it('converts a whole-dollar number to cents', () => {
    expect(parseAmountToCents(25)).toEqual({ ok: true, cents: 2500 })
  })

  it('converts a dollar string, ignoring a currency symbol and commas', () => {
    expect(parseAmountToCents('$1,500')).toEqual({ ok: true, cents: 150000 })
  })

  it('rounds cents to the nearest whole cent', () => {
    expect(parseAmountToCents('10.005')).toEqual({ ok: true, cents: 1001 })
  })

  it('rejects an amount below the minimum', () => {
    const result = parseAmountToCents(0.5)
    expect(result.ok).toBe(false)
  })

  it('rejects an amount above the maximum', () => {
    const result = parseAmountToCents(1_000_000)
    expect(result.ok).toBe(false)
  })

  it('rejects zero', () => {
    expect(parseAmountToCents(0).ok).toBe(false)
  })

  it('rejects a negative amount, which would otherwise be a refund', () => {
    expect(parseAmountToCents(-50).ok).toBe(false)
  })

  it('rejects NaN and Infinity', () => {
    expect(parseAmountToCents(Number.NaN).ok).toBe(false)
    expect(parseAmountToCents(Number.POSITIVE_INFINITY).ok).toBe(false)
  })

  it('rejects non-numeric text', () => {
    expect(parseAmountToCents('abc').ok).toBe(false)
    expect(parseAmountToCents('').ok).toBe(false)
  })

  it('rejects objects and null, which arrive from untrusted JSON', () => {
    expect(parseAmountToCents({} as unknown as number).ok).toBe(false)
    expect(parseAmountToCents(null as unknown as number).ok).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- donation`
Expected: FAIL — cannot resolve `./donation`

- [ ] **Step 3: Create `lib/donation.ts`**

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- donation`
Expected: `11 passed`

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add server-side donation amount validation"
```

---

### Task 26: Stripe Checkout and webhook routes

**Files:**
- Create: `lib/stripe.ts`, `app/api/stripe/checkout/route.ts`, `app/api/stripe/webhook/route.ts`
- Test: `lib/stripe.test.ts`, `app/api/stripe/checkout.test.ts`

- [ ] **Step 1: Install Stripe**

```bash
npm install stripe
```

- [ ] **Step 2: Write the failing test**

Create `lib/stripe.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

const ORIGINAL_ENV = { ...process.env }

describe('stripe configuration', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV }
  })

  it('reports unconfigured when STRIPE_SECRET_KEY is absent', async () => {
    delete process.env.STRIPE_SECRET_KEY
    const { isStripeConfigured } = await import('./stripe')
    expect(isStripeConfigured()).toBe(false)
  })

  it('reports configured when STRIPE_SECRET_KEY is present', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_x'
    const { isStripeConfigured } = await import('./stripe')
    expect(isStripeConfigured()).toBe(true)
  })

  it('reports recurring unavailable without a price id, even with a secret key', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_x'
    delete process.env.STRIPE_RECURRING_PRICE_ID
    const { isRecurringConfigured } = await import('./stripe')
    expect(isRecurringConfigured()).toBe(false)
  })

  it('reports recurring available with both a key and a price id', async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_x'
    process.env.STRIPE_RECURRING_PRICE_ID = 'price_123'
    const { isRecurringConfigured } = await import('./stripe')
    expect(isRecurringConfigured()).toBe(true)
  })

  it('throws a clear error if the client is requested while unconfigured', async () => {
    delete process.env.STRIPE_SECRET_KEY
    const { getStripe } = await import('./stripe')
    expect(() => getStripe()).toThrow(/STRIPE_SECRET_KEY/)
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- stripe`
Expected: FAIL — cannot resolve `./stripe`

- [ ] **Step 4: Create `lib/stripe.ts`**

```ts
import Stripe from 'stripe'

let client: Stripe | null = null

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}

/** Monthly giving additionally needs a recurring Price created in the Stripe dashboard. */
export function isRecurringConfigured(): boolean {
  return isStripeConfigured() && Boolean(process.env.STRIPE_RECURRING_PRICE_ID)
}

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not set; refusing to create a Stripe client.')
  }
  if (!client) {
    client = new Stripe(key)
  }
  return client
}

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- stripe`
Expected: `5 passed`

- [ ] **Step 6: Write the failing checkout route test**

Create `app/api/stripe/checkout.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { __resetRateLimit } from '@/lib/rate-limit'

const createSession = vi.fn(async () => ({ url: 'https://checkout.stripe.com/c/pay/test' }))

vi.mock('@/lib/stripe', () => ({
  isStripeConfigured: () => true,
  isRecurringConfigured: () => true,
  siteUrl: () => 'https://example.org',
  getStripe: () => ({ checkout: { sessions: { create: createSession } } }),
}))

function post(body: unknown, ip = '1.2.3.4') {
  return new Request('http://localhost/api/stripe/checkout', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify(body),
  })
}

describe('POST /api/stripe/checkout', () => {
  beforeEach(() => {
    __resetRateLimit()
    createSession.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('returns a checkout url for a valid one-time donation', async () => {
    const { POST } = await import('./checkout/route')
    const res = await POST(post({ amount: 50, frequency: 'once' }))
    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({ url: expect.stringContaining('stripe.com') })
  })

  it('charges the server-validated amount, not a client-supplied cents value', async () => {
    const { POST } = await import('./checkout/route')
    // A hostile client sends amount 1 plus a bogus amountCents of 1 cent.
    await POST(post({ amount: 1, frequency: 'once', amountCents: 1 }))
    const arg = createSession.mock.calls[0]![0] as any
    expect(arg.line_items[0].price_data.unit_amount).toBe(100)
  })

  it('rejects an amount below the minimum with 400', async () => {
    const { POST } = await import('./checkout/route')
    const res = await POST(post({ amount: 0.5, frequency: 'once' }))
    expect(res.status).toBe(400)
    expect(createSession).not.toHaveBeenCalled()
  })

  it('rejects a negative amount with 400', async () => {
    const { POST } = await import('./checkout/route')
    const res = await POST(post({ amount: -100, frequency: 'once' }))
    expect(res.status).toBe(400)
    expect(createSession).not.toHaveBeenCalled()
  })

  it('rejects an unknown frequency with 400', async () => {
    const { POST } = await import('./checkout/route')
    const res = await POST(post({ amount: 50, frequency: 'weekly' }))
    expect(res.status).toBe(400)
    expect(createSession).not.toHaveBeenCalled()
  })

  it('uses subscription mode for a monthly donation', async () => {
    const { POST } = await import('./checkout/route')
    await POST(post({ amount: 50, frequency: 'monthly' }))
    const arg = createSession.mock.calls[0]![0] as any
    expect(arg.mode).toBe('subscription')
  })

  it('uses payment mode for a one-time donation', async () => {
    const { POST } = await import('./checkout/route')
    await POST(post({ amount: 50, frequency: 'once' }))
    const arg = createSession.mock.calls[0]![0] as any
    expect(arg.mode).toBe('payment')
  })

  it('rate limits repeated attempts from one address', async () => {
    const { POST } = await import('./checkout/route')
    for (let i = 0; i < 10; i++) await POST(post({ amount: 25, frequency: 'once' }, '8.8.8.8'))
    const res = await POST(post({ amount: 25, frequency: 'once' }, '8.8.8.8'))
    expect(res.status).toBe(429)
  })
})
```

- [ ] **Step 7: Run test to verify it fails**

Run: `npm test -- checkout`
Expected: FAIL — cannot resolve `./checkout/route`

- [ ] **Step 8: Create `app/api/stripe/checkout/route.ts`**

Note that the amount always comes from `parseAmountToCents`. Any `amountCents` the client
sends is ignored entirely — that is what the second test above pins down.

```ts
import { NextResponse } from 'next/server'
import { parseAmountToCents } from '@/lib/donation'
import { checkRateLimit, clientIp } from '@/lib/rate-limit'
import { getStripe, isRecurringConfigured, isStripeConfigured, siteUrl } from '@/lib/stripe'

export const runtime = 'nodejs'

const RATE = { limit: 10, windowMs: 60_000 }

export async function POST(request: Request) {
  const ip = clientIp(request.headers)
  const rate = checkRateLimit(`checkout:${ip}`, RATE)
  if (!rate.ok) {
    return NextResponse.json(
      { message: 'Too many attempts. Please try again shortly.' },
      { status: 429, headers: { 'retry-after': String(rate.retryAfterSeconds) } },
    )
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      { message: 'Online donations are not available right now. Please contact MAPAC directly.' },
      { status: 503 },
    )
  }

  let payload: { amount?: unknown; frequency?: unknown }
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ message: 'Invalid request.' }, { status: 400 })
  }

  const frequency = payload.frequency
  if (frequency !== 'once' && frequency !== 'monthly') {
    return NextResponse.json({ message: 'Invalid donation frequency.' }, { status: 400 })
  }

  // The ONLY trusted source of the charge amount.
  const parsed = parseAmountToCents(payload.amount)
  if (!parsed.ok) {
    return NextResponse.json({ message: parsed.message }, { status: 400 })
  }

  if (frequency === 'monthly' && !isRecurringConfigured()) {
    return NextResponse.json(
      { message: 'Monthly giving is not available right now. Please make a one-time donation.' },
      { status: 503 },
    )
  }

  const base = siteUrl()
  const success = `${base}/donate/thank-you?frequency=${frequency}`
  const cancel = `${base}/donate`

  try {
    const stripe = getStripe()

    const session =
      frequency === 'monthly'
        ? await stripe.checkout.sessions.create({
            mode: 'subscription',
            line_items: [
              {
                price_data: {
                  currency: 'usd',
                  unit_amount: parsed.cents,
                  recurring: { interval: 'month' },
                  product_data: { name: 'Monthly donation to MAPAC' },
                },
                quantity: 1,
              },
            ],
            success_url: success,
            cancel_url: cancel,
          })
        : await stripe.checkout.sessions.create({
            mode: 'payment',
            line_items: [
              {
                price_data: {
                  currency: 'usd',
                  unit_amount: parsed.cents,
                  product_data: { name: 'Donation to MAPAC' },
                },
                quantity: 1,
              },
            ],
            success_url: success,
            cancel_url: cancel,
          })

    if (!session.url) {
      return NextResponse.json({ message: 'Could not start checkout.' }, { status: 502 })
    }

    return NextResponse.json({ url: session.url })
  } catch (cause) {
    console.error('[stripe] checkout session creation failed:', cause)
    return NextResponse.json(
      { message: 'We could not start checkout. Please try again, or contact MAPAC.' },
      { status: 502 },
    )
  }
}
```

- [ ] **Step 9: Run test to verify it passes**

Run: `npm test -- checkout`
Expected: `8 passed`

- [ ] **Step 10: Create `app/api/stripe/webhook/route.ts`**

Two things matter here: verify the signature against the **raw** body, and deduplicate on
event id so Stripe's retries do not double-count.

```ts
import { NextResponse } from 'next/server'
import { getStripe, isStripeConfigured } from '@/lib/stripe'

export const runtime = 'nodejs'

/**
 * Event ids already handled, for idempotency. Per-instance and memory-bound, which is
 * adequate because handling here is only logging. Move to a database before adding any
 * side effect that must happen exactly once.
 */
const seen = new Set<string>()
const SEEN_LIMIT = 1000

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!isStripeConfigured() || !secret) {
    // Not an error: the site is deployable before Stripe is wired up.
    return NextResponse.json({ received: false, reason: 'not configured' }, { status: 200 })
  }

  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ message: 'Missing stripe-signature header.' }, { status: 400 })
  }

  // Must be the raw body; parsing it first would break signature verification.
  const raw = await request.text()

  let event
  try {
    event = getStripe().webhooks.constructEvent(raw, signature, secret)
  } catch (cause) {
    console.error('[stripe] webhook signature verification failed:', cause)
    return NextResponse.json({ message: 'Invalid signature.' }, { status: 400 })
  }

  if (seen.has(event.id)) {
    return NextResponse.json({ received: true, duplicate: true })
  }
  if (seen.size >= SEEN_LIMIT) seen.clear()
  seen.add(event.id)

  switch (event.type) {
    case 'checkout.session.completed':
      console.info('[stripe] donation completed:', event.id)
      break
    case 'invoice.paid':
      console.info('[stripe] recurring donation paid:', event.id)
      break
    case 'customer.subscription.deleted':
      console.info('[stripe] recurring donation cancelled:', event.id)
      break
    default:
      break
  }

  return NextResponse.json({ received: true })
}
```

- [ ] **Step 11: Run the full suite and build**

Run: `npm test && npm run build`
Expected: all tests pass, build compiles

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: add Stripe checkout and webhook routes with server-side amount validation"
```

---

### Task 27: Donate page

**Files:**
- Create: `components/forms/DonationForm.tsx`, `app/donate/page.tsx`, `app/donate/thank-you/page.tsx`

- [ ] **Step 1: Create `components/forms/DonationForm.tsx`**

The frequency choice is a radio group, not two buttons, so keyboard and screen-reader
users get grouped semantics.

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { PRESET_AMOUNTS } from '@/lib/donation'

type Frequency = 'once' | 'monthly'

export function DonationForm({ recurringAvailable }: { recurringAvailable: boolean }) {
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
            const disabled = value === 'monthly' && !recurringAvailable
            return (
              <label
                key={value}
                className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded border px-4 text-sm font-medium ${
                  frequency === value
                    ? 'border-crimson bg-crimson text-white'
                    : 'border-border-subtle bg-white text-navy'
                } ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <input
                  type="radio"
                  name="frequency"
                  value={value}
                  checked={frequency === value}
                  disabled={disabled}
                  onChange={() => setFrequency(value)}
                  className="sr-only"
                />
                {value === 'once' ? 'One time' : 'Monthly'}
              </label>
            )
          })}
        </div>
        {!recurringAvailable && (
          <p className="mt-2 text-xs text-body">Monthly giving is not available right now.</p>
        )}
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
```

- [ ] **Step 2: Create `app/donate/page.tsx`**

When Stripe is unconfigured the page shows the mail-a-check path instead of a dead button
— the spec's graceful-degradation rule.

```tsx
import type { Metadata } from 'next'
import { DonationForm } from '@/components/forms/DonationForm'
import { Section } from '@/components/ui/Section'
import { site } from '@/data/site'
import { isRecurringConfigured, isStripeConfigured } from '@/lib/stripe'

export const metadata: Metadata = {
  title: 'Donate',
  description: 'Support MAPAC with a one-time or monthly donation.',
}

export default function DonatePage() {
  const stripeReady = isStripeConfigured()

  return (
    <Section aria-labelledby="donate-heading">
      <h1 id="donate-heading" className="text-3xl">
        Donate to MAPAC
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed">
        Your support funds MAPAC&rsquo;s advocacy, candidate evaluation, and civic education work
        across North Carolina.
      </p>

      <div className="mt-10 grid gap-12 lg:grid-cols-2">
        <div>
          {stripeReady ? (
            <DonationForm recurringAvailable={isRecurringConfigured()} />
          ) : (
            <div className="rounded-lg border border-border-subtle bg-surface p-6">
              <h2 className="text-lg">Donate by mail or phone</h2>
              <p className="mt-3 leading-relaxed">
                Online donations are being set up. In the meantime, you can send a check to the
                address below, or call us and we will take your donation directly.
              </p>
              <address className="mt-4 not-italic leading-relaxed">
                {site.address.line1}
                <br />
                {site.address.line2}
              </address>
              <p className="mt-3">
                <a href={site.phoneHref} className="font-medium text-crimson-deep underline">
                  {site.phone}
                </a>
              </p>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg">Prefer to mail a check?</h2>
          <p className="mt-3 leading-relaxed">Make it payable to MAPAC and send it to:</p>
          <address className="mt-3 not-italic leading-relaxed">
            {site.address.line1}
            <br />
            {site.address.line2}
          </address>
          <p className="mt-6 text-sm leading-relaxed">
            Questions about giving? Email{' '}
            <a href={`mailto:${site.email}`} className="font-medium text-crimson-deep underline">
              {site.email}
            </a>{' '}
            or call{' '}
            <a href={site.phoneHref} className="font-medium text-crimson-deep underline">
              {site.phone}
            </a>
            .
          </p>
        </div>
      </div>
    </Section>
  )
}
```

- [ ] **Step 3: Create `app/donate/thank-you/page.tsx`**

```tsx
import type { Metadata } from 'next'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'

export const metadata: Metadata = {
  title: 'Thank you',
  robots: { index: false },
}

type Props = { searchParams: Promise<{ frequency?: string }> }

export default async function ThankYouPage({ searchParams }: Props) {
  const { frequency } = await searchParams
  const monthly = frequency === 'monthly'

  return (
    <Section>
      <h1 className="text-3xl">Thank you for your support</h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed">
        {monthly
          ? 'Your monthly donation is set up. Stripe will email you a receipt for each payment, and you can cancel at any time.'
          : 'Your donation has been received. Stripe will email you a receipt.'}
      </p>
      <p className="mt-4 max-w-2xl leading-relaxed">
        Your contribution funds MAPAC&rsquo;s advocacy, candidate evaluation, and civic education
        work across North Carolina.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/">Return to the home page</Button>
        <Button href="/get-involved" variant="ghost">
          Get involved
        </Button>
      </div>
    </Section>
  )
}
```

- [ ] **Step 4: Verify both paths**

Run: `npm run build && npm run dev`

With no Stripe key, open `http://localhost:3000/donate`. Expected: the mail-a-check panel,
no dead button. Then:

```bash
echo 'STRIPE_SECRET_KEY=sk_test_placeholder' > .env.local
npm run dev
```

Expected: the amount picker renders, "Monthly" is disabled with an explanation (no price
id), and submitting shows an error rather than crashing, because the key is not real.

Stop the dev server and clean up:

```bash
rm .env.local
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add donate page with Stripe Checkout and mail-a-check fallback"
```

---
## Phase 6 — Verification and launch assets

### Task 28: Playwright and axe accessibility gate

**Files:**
- Create: `playwright.config.ts`, `e2e/navigation.spec.ts`, `e2e/forms.spec.ts`, `e2e/accessibility.spec.ts`
- Modify: `package.json`

- [ ] **Step 1: Install Playwright and axe**

```bash
npm install --save-dev @playwright/test @axe-core/playwright
npx playwright install chromium
```

- [ ] **Step 2: Create `playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
```

- [ ] **Step 3: Add scripts to `package.json`**

In `"scripts"`, add:

```json
"test:e2e": "playwright test",
"verify": "npm run lint && npx tsc --noEmit && npm test && npm run test:e2e"
```

- [ ] **Step 4: Create `e2e/navigation.spec.ts`**

```ts
import { test, expect } from '@playwright/test'

const ROUTES = [
  '/',
  '/about',
  '/elections',
  '/get-involved',
  '/news',
  '/donate',
  '/contact',
  '/privacy-policy',
]

test.describe('navigation', () => {
  for (const route of ROUTES) {
    test(`${route} renders with a single h1`, async ({ page }) => {
      const response = await page.goto(route)
      expect(response?.status()).toBe(200)
      await expect(page.locator('h1')).toHaveCount(1)
    })
  }

  test('the skip link is the first focusable element and reveals itself', async ({ page }) => {
    await page.goto('/')
    await page.keyboard.press('Tab')
    const skip = page.getByRole('link', { name: 'Skip to content' })
    await expect(skip).toBeFocused()
    await expect(skip).toBeVisible()
  })

  test('no page links to the retired 2026 primary page', async ({ page }) => {
    for (const route of ROUTES) {
      await page.goto(route)
      await expect(page.locator('a[href*="2026primary"]')).toHaveCount(0)
    }
  })

  test('the elections page renders no endorsements section while none are published', async ({
    page,
  }) => {
    await page.goto('/elections')
    await expect(page.getByRole('heading', { name: 'Our endorsements' })).toHaveCount(0)
  })

  test('every rubric table totals 100 points', async ({ page }) => {
    await page.goto('/elections')
    const totals = page.locator('tfoot td')
    const count = await totals.count()
    expect(count).toBe(5)
    for (let i = 0; i < count; i++) {
      await expect(totals.nth(i)).toHaveText('100')
    }
  })

  test('each criterion expands when its button is activated', async ({ page }) => {
    await page.goto('/elections')
    const first = page.getByRole('button', { name: /1\. Engagement with the Muslim Community/ })
    await expect(first).toHaveAttribute('aria-expanded', 'false')
    await first.click()
    await expect(first).toHaveAttribute('aria-expanded', 'true')
  })

  test('no page scrolls horizontally at phone width', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 800 })
    for (const route of ROUTES) {
      await page.goto(route)
      const overflows = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      )
      expect(overflows, `${route} must not scroll horizontally at 400px`).toBe(false)
    }
  })
})

test.describe('mobile navigation', () => {
  test.use({ viewport: { width: 400, height: 800 } })

  test('the menu button opens and closes the panel', async ({ page }) => {
    await page.goto('/')
    const toggle = page.getByRole('button', { name: 'Open menu' })
    await expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await toggle.click()
    await expect(page.getByRole('button', { name: 'Close menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    await expect(page.getByRole('link', { name: 'Elections' })).toBeVisible()
  })
})
```

- [ ] **Step 5: Create `e2e/forms.spec.ts`**

These run against the degraded (no-key) state, which is how the site will actually be
deployed first, so the fallbacks are what must be verified.

```ts
import { test, expect } from '@playwright/test'

test.describe('forms in the unconfigured state', () => {
  test('get involved offers direct contact details instead of broken inputs', async ({ page }) => {
    await page.goto('/get-involved')
    await expect(page.getByRole('link', { name: 'mail@mapacnc.com' }).first()).toBeVisible()
  })

  test('donate offers the mail-a-check path instead of a dead button', async ({ page }) => {
    await page.goto('/donate')
    await expect(page.getByText('P.O. Box 18196').first()).toBeVisible()
    await expect(page.getByRole('button', { name: /secure checkout/i })).toHaveCount(0)
  })

  test('the newsletter API rejects an invalid email with field errors', async ({ request }) => {
    const res = await request.post('/api/newsletter', {
      data: { name: 'Test', email: 'not-an-email' },
    })
    expect(res.status()).toBe(400)
    const body = await res.json()
    expect(body.errors.email).toBeTruthy()
  })

  test('the checkout API refuses a negative amount', async ({ request }) => {
    const res = await request.post('/api/stripe/checkout', {
      data: { amount: -500, frequency: 'once' },
    })
    // 400 if Stripe is configured, 503 if not. Either way it must never be 200.
    expect([400, 503]).toContain(res.status())
  })

  test('the webhook rejects a request with no signature', async ({ request }) => {
    const res = await request.post('/api/stripe/webhook', { data: { fake: true } })
    // 400 when configured, 200 "not configured" otherwise. Never a crash.
    expect([200, 400]).toContain(res.status())
  })
})
```

- [ ] **Step 6: Create `e2e/accessibility.spec.ts`**

```ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const ROUTES = [
  '/',
  '/about',
  '/elections',
  '/get-involved',
  '/news',
  '/donate',
  '/contact',
  '/privacy-policy',
]

for (const route of ROUTES) {
  test(`${route} has no WCAG A or AA violations`, async ({ page }) => {
    await page.goto(route)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(
      results.violations,
      results.violations.map((v) => `${v.id}: ${v.help}`).join('\n'),
    ).toEqual([])
  })
}
```

- [ ] **Step 7: Run the e2e suite**

Run: `npm run test:e2e`
Expected: all tests pass on both the desktop and mobile projects.

If an axe violation appears, fix the markup — do not relax the assertion or narrow the
tag list. Contrast failures in particular mean a colour was used outside the token set.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "test: add Playwright e2e and axe accessibility gate"
```

---

### Task 29: Logo, favicon, sitemap and robots

**Files:**
- Create: `public/logo.png`, `app/icon.png`, `app/sitemap.ts`, `app/robots.ts`
- Modify: `components/layout/Header.tsx`

- [ ] **Step 1: Download the existing logo**

```bash
mkdir -p public
curl -fsSL "https://mapacnc.com/wp-content/uploads/2024/03/mapacLogog.png" -o public/logo.png
file public/logo.png
```

Expected: `PNG image data`. If the download fails, skip to Step 4 and leave the wordmark
in the header; note it for MAPAC rather than substituting a different image.

- [ ] **Step 2: Use it as the favicon**

```bash
cp public/logo.png app/icon.png
```

Next.js serves `app/icon.png` as the site icon automatically; no `<link>` tag is needed.

- [ ] **Step 3: Show the logo in the header**

In `components/layout/Header.tsx`, add the import:

```tsx
import Image from 'next/image'
```

Replace the `<Link href="/">…</Link>` block with:

```tsx
        <Link href="/" className="flex items-center gap-3 text-white">
          <Image
            src="/logo.png"
            alt=""
            width={40}
            height={40}
            className="h-10 w-auto"
            priority
          />
          <span className="flex flex-col leading-tight">
            <span className="font-serif text-xl font-semibold tracking-tight">
              {site.shortName}
            </span>
            <span className="hidden text-xs text-white/70 lg:inline">{site.name}</span>
          </span>
        </Link>
```

`alt=""` is correct here: the adjacent text already names the link, so alt text would make
a screen reader announce MAPAC twice.

- [ ] **Step 4: Create `app/sitemap.ts`**

```ts
import type { MetadataRoute } from 'next'
import { content } from '@/lib/content'
import { siteUrl } from '@/lib/stripe'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()
  const routes = [
    '',
    '/about',
    '/elections',
    '/get-involved',
    '/news',
    '/donate',
    '/contact',
    '/privacy-policy',
  ]

  const posts = await content.getNews()

  return [
    ...routes.map((route) => ({
      url: `${base}${route}`,
      lastModified: new Date(),
    })),
    ...posts.map((post) => ({
      url: `${base}/news/${post.slug}`,
      lastModified: new Date(post.date),
    })),
  ]
}
```

- [ ] **Step 5: Create `app/robots.ts`**

```ts
import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/stripe'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: '/donate/thank-you' }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  }
}
```

- [ ] **Step 6: Verify**

Run: `npm run build && npm run dev`

Open `http://localhost:3000/sitemap.xml` — expected: eight URLs. Open
`http://localhost:3000/robots.txt` — expected: a sitemap line and the thank-you disallow.
Check the header shows the logo and the tab shows the favicon.

Stop the dev server.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add logo, favicon, sitemap and robots"
```

---

### Task 30: Full verification and handover notes

**Files:**
- Create: `README.md`

- [ ] **Step 1: Run the complete verification suite**

Run: `npm run verify`

Expected: lint clean, `tsc --noEmit` silent, all Vitest tests passing, all Playwright
tests passing on both projects. **Do not proceed past a failure.** Fix it, then re-run the
whole command — not just the failing test.

- [ ] **Step 2: Confirm no outdated content survived**

Run:

```bash
grep -rniE "early voting|2026primary|no upcoming events|there are no upcoming" \
  app components data content lib || echo "CLEAN"
```

Expected: `CLEAN`. Any hit is content the spec explicitly excluded.

- [ ] **Step 3: Confirm the content-layer boundary held**

Run:

```bash
grep -rn "from '@/data/" app components | grep -vE "data/(site|nav|goals|endorsement|endorsements)'" || echo "CLEAN"
```

Expected: `CLEAN` or only the allowed constant modules (`site`, `nav`, and the constants
re-exported from `endorsement`/`endorsements`). Any component importing `data/leadership`,
`data/governance`, or `data/pillars` directly has bypassed `lib/content` and must be
changed to use the adapter, or the Sanity migration will not be a one-file change.

- [ ] **Step 4: Create `README.md`**

```markdown
# MAPAC Website

The website for the Muslim American Public Affairs Council (mapacnc.com).

Next.js 15 (App Router), TypeScript, Tailwind CSS v4. Content lives in this repo; no CMS.

## Running it

```bash
npm install
npm run dev
```

## Verifying it

```bash
npm run verify   # lint, typecheck, unit tests, e2e tests, accessibility
```

`npm run test:e2e` includes an axe-core accessibility gate on every route. It fails the
build on any WCAG A or AA violation.

## Editing content

All site content is in `data/` and `content/`. Components never read these directly —
they go through `lib/content`, so content can later move to a CMS without touching any
component.

| What | Where |
| --- | --- |
| Address, phone, email, social links | `data/site.ts` |
| The eight goals | `data/goals.ts` |
| Board and Executive Committee roster | `data/leadership.ts` |
| Governance body descriptions | `data/governance.ts` |
| Endorsement principles, criteria, rubrics | `data/endorsement.ts` |
| Published endorsements | `data/endorsements.ts` |
| News and press releases | `content/news/*.mdx` |
| Navigation | `data/nav.ts` |

### Publishing an endorsement

Add an entry to the array in `data/endorsements.ts`:

```ts
{
  id: 'jane-smith-2026',
  candidate: 'Jane Smith',
  office: 'NC House District 11',
  cycle: 'November 2026 General',
  date: '2026-10-08',
  statementUrl: 'https://example.org/statement',
}
```

While that array is empty the Elections page shows no endorsements section at all. That
is deliberate: it is what stops the site from ever displaying a stale election page.

### Publishing a news post

Create `content/news/my-post.mdx`:

```mdx
---
title: MAPAC Statement on Voter Access
date: 2026-10-01
summary: One or two sentences for the index page.
---

The body of the statement, in Markdown.
```

The filename becomes the URL. `title`, `date` and `summary` are required.

### Updating the leadership roster

Edit `data/leadership.ts`. Change `leadershipYear` at the same time — the About page
labels the roster with it, so the year and the names must not drift apart.

## Environment variables

Copy `.env.example` to `.env.local`. **Every integration degrades gracefully when its
variable is missing**, so the site deploys and works before any of these exist:

| Variable | Without it |
| --- | --- |
| `RESEND_API_KEY` | Forms are replaced by the email address and phone number |
| `CONTACT_TO_EMAIL` | Defaults to `mail@mapacnc.com` |
| `STRIPE_SECRET_KEY` | Donate page shows the mail-a-check path, no dead button |
| `STRIPE_RECURRING_PRICE_ID` | Monthly giving is disabled; one-time still works |
| `STRIPE_WEBHOOK_SECRET` | Webhook returns "not configured" instead of failing |
| `NEXT_PUBLIC_SITE_URL` | Defaults to `http://localhost:3000`; set this in production |

### Stripe setup

1. In the Stripe dashboard, create a recurring Price (monthly, any amount — the amount is
   overridden per donation) and put its id in `STRIPE_RECURRING_PRICE_ID`.
2. Add a webhook endpoint at `https://<your-domain>/api/stripe/webhook` subscribed to
   `checkout.session.completed`, `invoice.paid`, and `customer.subscription.deleted`.
   Put its signing secret in `STRIPE_WEBHOOK_SECRET`.

Donation amounts are validated server-side in `lib/donation.ts`. The client's amount is
never trusted. Minimum $1, maximum $25,000.

## Adding a CMS later

`lib/content/source.ts` defines the `ContentSource` interface. To move to Sanity, add
`lib/content/sanity/` implementing that interface and change the one assignment in
`lib/content/index.ts`. No component changes.

## Outstanding items

See `docs/superpowers/specs/2026-09-25-mapac-website-design.md`, "Open items for MAPAC".
Most urgent: confirm the current leadership roster (the site ships the 2025 slate, clearly
labelled) and confirm the P.O. Box ZIP, which the old site and the endorsement guide PDF
disagree on (27619 vs 27606).
```

- [ ] **Step 5: Run the verification suite one final time**

Run: `npm run verify`
Expected: everything passes.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "docs: add README with content editing and deployment notes"
```

---

## Definition of done

Every box above is checked, and:

- [ ] `npm run verify` passes end to end
- [ ] The site builds and runs with **no** environment variables set, with every
      integration showing its fallback rather than a broken control
- [ ] No page references early voting, the 2026 primary page, or an events widget
- [ ] `/elections` shows no endorsements section while `data/endorsements.ts` is empty
- [ ] All five rubric tables total 100 points
- [ ] The About page shows eight goals; the home page shows six
- [ ] The leadership heading reads "2025", matching `leadershipYear`
- [ ] axe reports zero WCAG A/AA violations on all eight routes
- [ ] No page scrolls horizontally at 400px width
- [ ] No component imports from `data/leadership`, `data/governance` or `data/pillars`
      directly — all content reads go through `lib/content`
- [ ] Every navy CONTAINER carries `on-navy`; no small navy element (e.g. a Button
      variant) does. Verify mechanically — note `hover:bg-navy-*` is excluded, since a
      hover background on a child of a navy container inherits correctly:

      ```bash
      # navy containers missing on-navy -- must be empty
      grep -rnE '(^|[" ])bg-navy' app components --include='*.tsx' | grep -v on-navy
      # on-navy applied to a Button variant -- must be empty
      grep -n "on-navy" components/ui/Button.tsx | grep -v '^\s*[0-9]*: *//'
      ```
- [ ] Keyboard focus is clearly visible on the navy header, hero, CTA band and footer
      — checked by tabbing through the real rendered page, not just by axe

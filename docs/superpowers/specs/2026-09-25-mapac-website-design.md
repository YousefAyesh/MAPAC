# MAPAC Website Rebuild — Design

**Date:** 2026-09-25
**Status:** Approved
**Source of content:** https://mapacnc.com/ (WordPress/Divi), harvested 2026-09-25

## Goal

Replace MAPAC's WordPress site with a Next.js site that carries over all evergreen
content, drops every outdated election artifact, and fixes the two structural
weaknesses of the old site: a dead-end election page and a membership page that
asks people to join without saying what joining means.

## Constraints

- No CMS at launch. Content lives in the repo. Sanity may be added later, so the
  content layer must be swappable without touching components.
- No outdated events. Nothing dated is published unless MAPAC has published it and
  it is still current.
- Existing brand identity (navy/crimson, existing logo) is preserved. No rebrand.
- Stripe account, email service keys, and any credentials are supplied by MAPAC.
  Every integration is built behind env vars and degrades gracefully without them.

## Stack

- Next.js 15, App Router, TypeScript
- Tailwind CSS v4 (`@theme` tokens in `app/globals.css`)
- `next/font` self-hosting Source Serif 4 + Inter
- Vercel deployment; static rendering by default, Node runtime only on API routes
- Vitest (unit), Playwright + axe-core (e2e + accessibility)

## Content layer

Components never read data files directly. All content is reached through one adapter:

```
lib/content/
  types.ts     BoardMember Trustee NewsItem Principle Criterion Rubric Endorsement Goal
  source.ts    interface ContentSource: getLeadership() getGoals() getNews()
               getNewsBySlug() getPrinciples() getCriteria() getRubrics() getEndorsements()
  local/       current implementation — reads data/*.ts and content/news/*.mdx
  index.ts     exports the active source
```

Migrating to Sanity later means adding `lib/content/sanity/` implementing the same
interface and changing one export in `index.ts`. No component changes.

## Routes

```
app/
  layout.tsx                  root layout, header, footer, skip link
  page.tsx                    Home
  about/page.tsx              mission, six goals, governance, leadership
  elections/page.tsx          endorsement guide + current-cycle endorsements
  get-involved/page.tsx       membership, newsletter, volunteer
  news/page.tsx               index
  news/[slug]/page.tsx        individual post (MDX)
  donate/page.tsx             one-time + monthly
  donate/thank-you/page.tsx   post-checkout return
  contact/page.tsx
  privacy-policy/page.tsx
  not-found.tsx  error.tsx
  api/newsletter/route.ts
  api/get-involved/route.ts
  api/stripe/checkout/route.ts
  api/stripe/webhook/route.ts
```

## Component structure

```
components/
  layout/   Header Nav MobileNav Footer SkipLink
  ui/       Button Card Section Prose Field Disclosure
  home/     Hero MissionSummary PillarsRow GoalsGrid CtaBand
  about/    GovernanceSection LeadershipGrid PersonCard
  elections/ PrinciplesList CriteriaAccordion RubricTable EndorsementCard
  forms/    NewsletterForm GetInvolvedForm DonationAmountPicker
content/news/*.mdx
data/     site.ts goals.ts pillars.ts leadership.ts principles.ts criteria.ts
          rubrics.ts endorsements.ts governance.ts
lib/      content/ stripe.ts email.ts validation.ts rate-limit.ts
```

## Content to carry over (evergreen)

- **Name:** Muslim American Public Affairs Council (MAPAC)
- **Tagline:** "Empowering American Muslims through Advocacy and Unity"
- **Mission:** "The Muslim American Public Affairs Council (MAPAC) is an organization
  that aims to lobby at all levels of government on behalf of our growing American
  Muslim community."
- **Six goals:** educate and encourage American Muslims to partake in the US political
  process; lobby politicians at all levels; enhance political empowerment of American
  Muslims; educate American policy makers on issues of concern to Muslims; present
  Islamic tradition, values, history and culture; foster inter-religious and
  inter-ethnic understanding.
- **Three pillars:** Elevating Diversity, Advocating for Inclusivity, Fostering Dialogue
- **Governance:** four bodies — Board of Trustees, Executive Committee, General Body
  (voting and associate members), Appointed Committees
- **Leadership (2025):** Dr. Nabil Abdel-Rahman (Chair), Dr. Hisham Mohamed (Vice-Chair),
  Mohamed Kenawey (Treasurer), Ahmad Herzallah (Secretary); trustees Majid Abdel-Raziq,
  Dr. Mimi Aljabi, Nigel Edwards, Dr. Ahmed Khalil, Mohammad Omary, Shahid Shibbir,
  Manal Sidawi, Amjad Syam. Executive Committee: Nigel Edwards (President),
  Dr. Mimi Aljabi (PAC Chair), Dr. Ahmed Khalil (Education Chair),
  Shahid Shibbir (Media Chair), Majid Abdel-Raziq (PR & Outreach Chair).
- **Endorsement framework:** ten core principles; eight evaluation criteria (Engagement
  with the Muslim Community, Qualifications and Capabilities, Commitment to Civil
  Liberties, Integrity and Ethics, Policy Positions/Platform/Vision, Performance Record,
  Stance on Foreign Policy, Electability and Campaign Standing); scoring rubrics for
  local/city/county, judiciary, state legislature, state executive, federal legislature
- **Contact:** P.O. Box 18196, Raleigh, NC 27619 · (984) 254-7441 · mail@mapacnc.com
- **Social:** Instagram @mapacnc · Facebook MuslimAmericanPublicAffairsC0UNCIL ·
  YouTube UCtmElPYwXVIYh3OqXhTU9vg
- **Logo:** port `mapacLogog.png` from the old site

## Content deliberately excluded

| Excluded | Reason |
|---|---|
| "Early Voting has started!" alert bar | NC 2026 primary was March 2026; stale |
| `/2026primary/` page | Past election cycle |
| 2024 endorsement lists (Triangle, Triad, Charlotte) | Two cycles old |
| "There are no upcoming events" widget | Announcing an absence is worse than silence |
| Feb 2025 Gaza statement, Sept 2024 presidential endorsement, Jan 2026 newsletter | Dated; News ships empty, these can be ported as archive entries on request |
| Divi theme colors `#ee0d08` `#f35653` `#810003`-adjacent strays | Palette consolidation |
| Four of five loaded typefaces | Type consolidation |

Per-page decisions that follow from this:

- **Elections** renders its endorsements section only when `data/endorsements.ts` is
  non-empty. Empty array means the section does not exist — no "check back soon"
  placeholder, no stale cycle.
- **News** ships with zero posts; the index handles the empty state.
- **Leadership** heading is year-labeled ("Leadership — 2025") so the roster is
  visibly dated rather than silently wrong.

## Design system

Colors, all verified against WCAG 2.1:

| Token | Value | Use | Contrast |
|---|---|---|---|
| `navy` | `#022047` | headers, footer, headings | 16.15:1 on white (AAA) |
| `crimson` | `#c80f15` | buttons, accents | white on it 5.94:1 (AA) |
| `crimson-deep` | `#810003` | inline links, hover | 10.85:1 on white (AAA) |
| `surface` | `#f7f8fa` | alternating sections | — |
| `body` | `#475569` | body text | 7.58:1 on white (AAA) |
| `border` | `#e2e8f0` | rules, card edges | — |

- **Type:** Source Serif 4 (display/headings), Inter (body/UI). Self-hosted via
  `next/font`. Modular scale, ratio 1.25.
- **Spacing:** 4px base scale as tokens.
- **Light mode only.** Tokens structured to permit dark mode later; not built now.

## Accessibility requirements

- Skip-to-content link as first focusable element
- Visible focus rings throughout; `outline: none` is never used without a replacement
- 44px minimum touch targets
- Real `<label>` for every form field; errors associated via `aria-describedby`
- Semantic landmarks (`header` `nav` `main` `footer`)
- Criteria accordion implemented as disclosure buttons with `aria-expanded`, not divs
- `prefers-reduced-motion` honored on all transitions
- `axe-core` assertions run in Playwright and fail CI

## Integrations

**Stripe (donations)** — redirect-based Checkout. Site renders amount pickers; card
entry happens on Stripe's hosted page. MAPAC keeps its existing Stripe account.
`api/stripe/checkout` validates the requested amount server-side against an allowed
range and never trusts the client value. `api/stripe/webhook` verifies the Stripe
signature and deduplicates on event ID for idempotency. Recurring donations use a
Checkout subscription mode price.

**Email (newsletter + get involved)** — forms post to API routes. Launch
implementation sends via Resend to `mail@mapacnc.com`. Swapping to Mailchimp later is
confined to `lib/email.ts`.

**Graceful degradation:** when an integration's env var is absent, the UI substitutes a
working fallback rather than a broken control — the donate button becomes the P.O. Box
and phone number, the newsletter form becomes a `mailto:`. A build-time warning is
logged. The site is deployable before any credential exists.

## Error handling

- Shared zod schemas validate forms on both client and server
- Field-level errors inline; a single generic message on server failure
- Honeypot field plus per-IP rate limiting on all POST routes
- Branded `not-found.tsx` and `error.tsx`
- Content adapter returns empty collections rather than throwing on missing files

## Testing

- **Vitest:** content adapters, zod schemas, donation amount validation, MDX frontmatter parsing
- **Playwright:** mobile navigation, newsletter submission (API mocked), donate → Stripe redirect (mocked)
- **axe-core:** every route asserted in the Playwright run

## Open items for MAPAC

1. Current (2026) leadership roster, to replace the 2025 names
2. Stripe publishable/secret keys and webhook signing secret
3. Resend (or Mailchimp) API key
4. Whether to port the three archived news items
5. Higher-resolution logo than `mapacLogog.png` if one exists

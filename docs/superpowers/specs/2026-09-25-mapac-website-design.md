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

## Framework version

`create-next-app@latest` installs **Next.js 16.3.7** (React 19.2.8, Tailwind 4.3.3), not
the 15 this spec originally named. Next 16 is accepted rather than downgraded: it is the
current stable release, and every API this design relies on — async `params`/`searchParams`,
`MetadataRoute`, `next/font`, `next/image`, `generateStaticParams`, Node-runtime route
handlers — is unchanged across the 15→16 boundary. The one unverified dependency is
`next-mdx-remote` (peers only `react: >=16`, so not version-locked); if it misbehaves under
Next 16, `@next/mdx` is the maintained fallback.

## Stack

- Next.js 16 (App Router), TypeScript — see "Framework version" below
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

**Two caveats on that promise**, raised in review of this layer and worth knowing before
the Sanity adapter is written:

1. **No preview or pagination hooks.** A CMS-backed source will eventually want
   `getNews({ preview })` or `{ limit, cursor }`. Adding an options bag to a method
   signature *is* a call-site-visible change, so that specific extension is not covered by
   the one-export promise. Not pre-built here — with two posts and no CMS it would be
   speculative — but it is a known future signature change rather than a surprise.
2. **`NewsItem.body` is MDX-shaped by contract.** It is a string ready for `<MDXRemote>`.
   Sanity stores rich text as portable text, so its adapter owns serializing to that same
   shape. The alternative — returning raw blocks and giving the renderer a second code
   path — is explicitly not the contract. This is documented on the type itself.

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
- **Eight goals** (the About page lists two the home page omits): educate and encourage
  American Muslims to partake in the US political process; lobby politicians at all
  levels; enhance political empowerment of American Muslims; educate American policy
  makers on issues of concern to Muslims; present Islamic tradition, values, history and
  culture; foster inter-religious and inter-ethnic understanding; strive for assurance of
  basic human rights of all Americans and of all Muslims; strive to eliminate any
  vestiges of discrimination on the basis of race, gender, religion or ethnicity.
- **"What We Do" paragraph:** MAPAC focuses on politics and its effect on Muslims in
  America; supports Islamic Organizations in fulfilling their responsibility for
  religious affairs; and supports other Muslim organizations in areas such as peace and
  human rights.
- **Three pillars:** Elevating Diversity, Advocating for Inclusivity, Fostering Dialogue
- **Governance:** four bodies, with verbatim bylaws descriptions available on the About
  page — Board of Trustees (7–15 elected members drawn from Voting Members, three-year
  terms), Executive Committee (President as chair, Standing Committee Chairs, Secretary,
  Treasurer; trustees are pro forma members), General Body (Voting Members who pay dues
  and accept the constitution; Associate Members, who may be non-Muslim, are exempt from
  voting and ineligible for BOT/EC but receive all other benefits including discounted
  event entry), Appointed Committees (ad hoc or standing, to distribute day-to-day tasks
  and provide leadership training)
- **Leadership (2025) — 12 named members.** The page text says the board has 7–15
  elected members; twelve are named, so twelve ship. Do not invent a thirteenth.
  Officers: Dr. Nabil Abdel-Rahman (Chair), Dr Hisham Mohamed (Vice-Chair),
  Mohamed Kenawey (Treasurer), Ahmad Herzallah (Secretary). Trustees: Majid Abdel-Raziq,
  Dr. Mimi Aljabi, Nigel Edwards, Dr. Ahmed Khalil, Mohammad Omary, Shahid Shibbir,
  Manal Sidawi, Amjad Syam. Executive Committee: Nigel Edwards (President),
  Dr. Mimi Aljabi (Chair, Political Action Committee), Dr. Ahmed Khalil (Chair,
  Education Committee), Shahid Shibbir (Chair, Media Committee), Majid Abdel-Raziq
  (Chair, Public Relations & Outreach Committee).
- **Outgoing trustees acknowledged** (12, evergreen recognition, not an event):
  Dr. Khodr Zaarour, Dr. Faisal Syed, Aisha Shoman, Kanwal Naiyar, Ford Chambliss,
  Jihad Shawwa, Musa Lipford, Elham Idris, Fatima Anam, Khalid Awan, Sohaila Dar,
  Zainab Abdul-Qaabidh Amir.
- **Endorsement framework.** The authoritative source is
  `MAPAC-2026-Endorsement-Guide.pdf` (10 pages), linked from the old Endorsement Guide
  page. It contains substantially more than the web page showed:
  - **Eight evaluation criteria**, each with a "most favorable description" of what a
    top score looks like: Engagement with the Muslim Community, Qualifications and
    Capabilities, Commitment to Civil Liberties, Integrity and Ethics, Policy
    Positions/Platform/Vision, Performance Record, Stance on Foreign Policy,
    Electability and Campaign Standing
  - **A 1–5 scoring scale:** 1 Very Poor, 2 Poor, 3 Fair, 4 Good, 5 Excellent
  - **Weighted rubrics for five office levels**, each totalling 100 points. Weight
    factors (×5 for percentage points), in criterion order as listed above:
    - Local, City, and County Officials — 4, 2, 2, 3, 3, 3, 1, 2
    - Judiciary — 3, 3, 4, 4, 1, 2, 1, 2
    - State Legislature — 3, 3, 3, 2, 3, 3, 1, 2
    - State Executive Officials — 4, 3, 3, 3, 2, 2, 1, 2
    - Federal Legislature — 3, 2, 2, 3, 2, 2, 4, 2
  - **Two hard rules:** candidates exhibiting hatred or contempt toward Muslims or their
    faith are automatically disqualified, as are candidates who support or condone the
    persecution or killing of Muslims abroad. Endorsements also require direct contact
    between the endorsement team and the candidate.
  - **Office-level evaluation guidance** for local offices (NC's Mayor-Council-City
    Manager form), city councils and county commissioners, boards of education, judicial
    offices (NC elects all judges; appellate vs. lower court skill sets differ), and
    state legislative offices
  - **"Tools for Researching Candidates"** — ten categories of voter-research
    resources with links (Ballotpedia, VoteSmart, PolitiFact, FactCheck.org, FEC,
    `ncleg.gov/Legislation/Votes`, PBS North Carolina, WUNC Politics Podcast, Do Politics
    Better, FiveThirtyEight, Cook Political Report). This is evergreen civic-education
    content and is worth a section of its own.
- **Contact:** P.O. Box 18196, Raleigh, NC 27619 · (984) 254-7441 · mail@mapacnc.com
  - **Discrepancy to confirm:** the website footer says ZIP **27619**; the endorsement
    guide PDF letterhead says **27606**. The site ships 27619 (the more recently updated
    surface) and this is an open item for MAPAC.
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
| Divi theme strays `#ee0d08` `#f35653` `#cf2e2e` `#ea2c59` | Palette consolidation; navy, `#c80f15` and `#810003` are kept as tokens |
| Four of five loaded typefaces | Type consolidation |

Per-page decisions that follow from this:

- **Elections** renders its endorsements section only when `data/endorsements.ts` is
  non-empty. Empty array means the section does not exist — no "check back soon"
  placeholder, no stale cycle.
- **News** ships with zero posts; the index handles the empty state.
- **Home** shows the six goals from the old home page; **About** shows all eight. Both
  read from the same `getGoals()` collection, with Home slicing to the first six.
- **Leadership** heading is year-labeled ("Leadership — 2025") so the roster is
  visibly dated rather than silently wrong.

## Endorsement guide detail level

**Decision:** match the old website's disclosure level. The Elections page publishes:

- The condensed principles paragraph the old Endorsement Guide page already displayed
- All eight criteria **with** their "most favorable description" from the PDF
- The 1–5 scoring scale and both automatic-disqualification rules
- All five weighted rubric tables
- The office-level evaluation guidance
- The "Tools for Researching Candidates" resources
- A prominent link to `MAPAC-2026-Endorsement-Guide.pdf`

It does **not** reproduce the detailed values outline from pages 1–2 of the PDF (positions
on abortion, sexuality and gender education, Patriot Act and FISA repeal, boycott and
divestment). Those remain available in the linked PDF, exactly as MAPAC currently
publishes them. Rationale: the gap between the website's condensed paragraph and the
PDF's full outline is a deliberate editorial choice by the organization, and a rebuild
should not silently change what the site amplifies. Revisit only at the board's request.

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
2. Confirmation of the full board roster — the site names 12 members; verify none are missing
3. Stripe publishable/secret keys and webhook signing secret
4. Resend (or Mailchimp) API key
5. Stripe price ID for the recurring/monthly donation product
6. Whether to port the three archived news items
7. Higher-resolution logo than `mapacLogog.png` if one exists
8. Confirm the P.O. Box ZIP: website says 27619, endorsement guide PDF says 27606
9. Whether the board wants the PDF's full values outline published on-page as well
   (currently no — see "Endorsement guide detail level")

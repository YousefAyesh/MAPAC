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
variable is missing**, so the site deploys and works before any of these exist — this is
how it will actually ship: with none of them set.

| Variable | Without it |
| --- | --- |
| `RESEND_API_KEY` | Forms are replaced by the email address and phone number |
| `CONTACT_TO_EMAIL` | Defaults to `mail@mapacnc.com` |
| `STRIPE_SECRET_KEY` | Donate page shows the mail-a-check path, no dead button |
| `STRIPE_WEBHOOK_SECRET` | Webhook returns "not configured" instead of failing |
| `NEXT_PUBLIC_SITE_URL` | Defaults to `http://localhost:3000`; set this in production |

### Stripe setup

1. Put the secret key in `STRIPE_SECRET_KEY`. One-time and monthly giving both turn on
   with it; monthly gifts are created with inline pricing, so no Price needs to exist in the
   Stripe dashboard.
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

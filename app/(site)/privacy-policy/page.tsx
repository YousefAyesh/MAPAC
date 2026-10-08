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
        <p>
          This policy describes what this website does. It is written to match how the site
          actually works rather than to make commitments on MAPAC&rsquo;s behalf; MAPAC may
          wish to have it reviewed and expanded by counsel.
        </p>

        <h2>What this site collects</h2>
        <p>
          Only what you type into one of its two forms. The contact-list form asks for your
          name and email address. The get-involved form asks for your name, email address,
          how you would like to take part, and optionally your phone number and a message.
          The site asks for nothing else and collects nothing automatically.
        </p>

        <h2>Where it goes</h2>
        <p>
          Form submissions are sent by email to{' '}
          <a href={`mailto:${site.email}`}>{site.email}</a> and are not stored on this
          website or in any database. The email is delivered by a third-party email
          service acting on MAPAC&rsquo;s behalf. Your details therefore live in
          MAPAC&rsquo;s email inbox, and how long they are kept is a matter of
          MAPAC&rsquo;s own record-keeping.
        </p>

        <h2>Cookies and tracking</h2>
        <p>
          This site sets no cookies, and includes no analytics, advertising or tracking
          scripts of any kind.
        </p>

        <h2>Donations</h2>
        <p>
          Donations are processed by Stripe. Card details are entered on Stripe&rsquo;s own
          pages and are never received or stored by this website or by MAPAC. Stripe
          handles that information under its own privacy policy.
        </p>

        <h2>Asking us to remove your details</h2>
        <p>
          Email <a href={`mailto:${site.email}`}>{site.email}</a> and ask, or write to us at
          the address below. Because this website stores nothing, any request concerns the
          records MAPAC holds.
        </p>

        <h2>Questions</h2>
        <p>
          Send questions about this policy to{' '}
          <a href={`mailto:${site.email}`}>{site.email}</a>, or by mail to{' '}
          {site.address.line1}, {site.address.line2}.
        </p>
      </Prose>
    </Section>
  )
}

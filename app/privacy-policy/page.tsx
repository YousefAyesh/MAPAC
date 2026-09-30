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

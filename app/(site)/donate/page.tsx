import type { Metadata } from 'next'
import { DonationForm } from '@/components/forms/DonationForm'
import { Photo } from '@/components/ui/Photo'
import { Section } from '@/components/ui/Section'
import { photo } from '@/data/photos'
import { site } from '@/data/site'
import { isStripeConfigured } from '@/lib/stripe'

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
            <DonationForm />
          ) : (
            <div className="rounded-lg border border-border-subtle bg-surface p-6">
              <h2 className="text-lg">Donate by mail or phone</h2>
              <p className="mt-3 leading-relaxed">
                Online donations are being set up. In the meantime you can send a check to the
                address below, or call us to ask how else you can give.
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
          {/* When Stripe is off, the fallback card already shows the mailing address. */}
          {stripeReady && (
            <>
              <h2 className="text-lg">Prefer to mail a check?</h2>
              <p className="mt-3 leading-relaxed">Send it to:</p>
              <address className="mt-3 not-italic leading-relaxed">
                {site.address.line1}
                <br />
                {site.address.line2}
              </address>
            </>
          )}
          <p className={`${stripeReady ? 'mt-6 ' : ''}text-sm leading-relaxed`}>
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
          <Photo
            photo={photo.iftar_guests}
            aspect="aspect-[4/3]"
            sizes="(max-width: 1024px) 100vw, 30rem"
            className="mt-8"
          />
        </div>
      </div>
    </Section>
  )
}

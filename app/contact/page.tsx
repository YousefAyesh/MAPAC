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

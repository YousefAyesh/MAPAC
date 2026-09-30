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

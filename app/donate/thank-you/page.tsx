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
          ? 'Your monthly donation is set up. To change or cancel it, email us and we will take care of it.'
          : 'Your donation has been received.'}
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

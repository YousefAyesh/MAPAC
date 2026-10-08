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

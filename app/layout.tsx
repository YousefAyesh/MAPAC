import type { Metadata } from 'next'
import { site } from '@/data/site'
import { siteUrl } from '@/lib/site-url'
import { inter, sourceSerif } from '@/lib/fonts'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${site.name} (${site.shortName})`,
    template: `%s | ${site.shortName}`,
  },
  description: site.mission,
  openGraph: {
    title: `${site.name} (${site.shortName})`,
    description: site.mission,
    siteName: site.shortName,
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable}`}>
      {/* Site chrome lives in app/(site)/layout.tsx so /studio can render without it. */}
      <body className="flex min-h-screen flex-col">{children}</body>
    </html>
  )
}

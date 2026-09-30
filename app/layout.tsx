import type { Metadata } from 'next'
import { inter, sourceSerif } from '@/lib/fonts'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Muslim American Public Affairs Council',
    template: '%s | MAPAC',
  },
  description:
    'MAPAC lobbies at all levels of government on behalf of our growing American Muslim community.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable}`}>
      <body>{children}</body>
    </html>
  )
}

import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { SkipLink } from '@/components/layout/SkipLink'

/**
 * Header, main landmark and footer around every public page. Lives outside the root
 * layout so /studio (the Sanity editor) can fill the whole window without them.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink />
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  )
}

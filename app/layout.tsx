import { ReactNode, Suspense } from 'react'
import clsx from 'clsx'
import { Metadata, Viewport } from 'next'
// eslint-disable-next-line camelcase
import { Open_Sans } from 'next/font/google'
import localFont from 'next/font/local'

import './globals.css'
import {
  ClientSiteNavbar,
  Grunge,
  Rainbow,
  SiteNavbar,
  SmallRainbow,
} from '@/components'
import { ROUTES } from '@/constants'
import { Providers } from '@/lib/components'

type Props = {
  children: ReactNode
}

export const metadata: Metadata = {
  description:
    "I'm a software engineer, and these are some of the things I've been up to.",
  manifest: '/site.webmanifest',
  title: 'Houston C. Green',
}

export const viewport: Viewport = {
  themeColor: '#1B1B1B',
  width: 'device-width',
}

const porterSansBlock = localFont({
  src: './fonts/porter-sans-inline-block-webfont.woff',
  variable: '--font-porter-sans-block',
  weight: '700',
})

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans',
  weight: ['400', '500', '600', '700'],
})

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <body
        className={clsx(
          porterSansBlock.variable,
          openSans.variable,
          'leading-lg font-open-sans text-foreground bg-background relative h-full',
        )}
      >
        <Providers>
          <div className="relative flex min-h-screen justify-between gap-6">
            <Grunge
              aria-hidden
              className="md:display-unset sticky top-0 left-0 hidden h-full max-h-screen"
              preserveAspectRatio="none"
            />
            <div className="relative flex-1">
              <header className="bg-background sticky top-0 right-0 py-6">
                <Suspense fallback={<SiteNavbar pathname={ROUTES.home} />}>
                  <ClientSiteNavbar />
                </Suspense>
              </header>
              <main>{children}</main>
            </div>
            <Rainbow
              aria-hidden
              className="md:display-unset sticky top-0 right-0 hidden h-full max-h-screen"
              preserveAspectRatio="none"
            />
            <SmallRainbow
              aria-hidden
              className="sticky top-0 right-0 h-full max-h-screen md:hidden"
              preserveAspectRatio="none"
            />
          </div>
        </Providers>
      </body>
    </html>
  )
}

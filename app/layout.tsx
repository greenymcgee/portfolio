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
} from '@/globals/components'
import { Toaster } from '@/globals/components/ui'
import { ROUTES } from '@/globals/constants'
import { ProviderTree } from '@/providers'

type Props = {
  children: ReactNode
}

export const metadata: Metadata = {
  description:
    "I'm a software engineer, and these are some of the things I've been up to.",
  manifest: '/manifest.json',
  title: 'Houston C. Green',
}

export const viewport: Viewport = {
  themeColor: '#3CC0C3',
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
    <html
      className={clsx(
        'leading-lg font-open-sans overscroll-behavior-none',
        porterSansBlock.variable,
        openSans.variable,
      )}
      lang="en"
      suppressHydrationWarning
    >
      <body className="text-foreground bg-background relative h-full">
        <ProviderTree>
          <div className="relative flex min-h-screen justify-between gap-6">
            <Grunge
              aria-hidden
              className="md:display-unset sticky top-0 left-0 z-20 hidden h-screen"
              preserveAspectRatio="none"
            />
            <div className="relative min-w-0 flex-1">
              <header
                className={clsx(
                  'full-bleed-bg sticky top-0 right-0 z-10 py-6',
                  'lg:bg-background',
                )}
              >
                <Suspense fallback={<SiteNavbar pathname={ROUTES.home} />}>
                  <ClientSiteNavbar />
                </Suspense>
              </header>
              {children}
            </div>
            <Rainbow
              aria-hidden
              className="md:display-unset sticky top-0 right-0 z-20 hidden h-screen"
              preserveAspectRatio="none"
            />
            <SmallRainbow
              aria-hidden
              className="sticky top-0 right-0 z-20 h-screen shrink-0 md:hidden"
              preserveAspectRatio="none"
            />
          </div>
          <Toaster />
        </ProviderTree>
      </body>
    </html>
  )
}

// app/layout.tsx
import clsx from 'clsx'
import { Metadata } from 'next'
// eslint-disable-next-line camelcase
import { Open_Sans } from 'next/font/google'
import localFont from 'next/font/local'

import './globals.css'
import { Providers } from '@/lib/components'

import Header from './Header'

export const metadata: Metadata = {
  description: 'Coming soon',
  title: 'Coming soon',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  )
}

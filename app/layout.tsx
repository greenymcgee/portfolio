// app/layout.tsx
import { Metadata } from 'next'

import './globals.css'
import { Providers } from '@/lib/components'

import Header from './Header'

export const metadata: Metadata = {
  description: 'Coming soon',
  title: 'Coming soon',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
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

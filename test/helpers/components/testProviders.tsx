'use client'

import { PropsWithChildren } from 'react'
import { ThemeProvider } from 'next-themes'

import { AdminMenuContextProvider } from '../../../providers/adminMenu'
import { MockSessionProvider } from './mockSessionProvider'
import { MockThemeProvider } from './mockThemeProvider'

type AdminMenuProviderProps = PropsOf<typeof AdminMenuContextProvider>

type Props = {
  /**
   * The SessionProvider makes async requests that we don't want in every test
   * that might need providers. Defaults to false.
   */
  includesSession?: boolean
  /**
   * The ThemeProvider adds a script tag that we don't want in every test that
   * might need providers. Defaults to false.
   */
  includesTheme?: boolean
  initialAdminMenuContent?: AdminMenuProviderProps['initialContent']
  themeProviderProps?: PropsOf<typeof ThemeProvider>
}

export function TestProviders({
  children,
  includesSession = false,
  includesTheme = false,
  initialAdminMenuContent,
  themeProviderProps,
}: PropsWithChildren<Props>) {
  return (
    <MockSessionProvider includesSession={includesSession}>
      <AdminMenuContextProvider initialContent={initialAdminMenuContent}>
        <MockThemeProvider
          includesTheme={includesTheme}
          {...themeProviderProps}
        >
          {children}
        </MockThemeProvider>
      </AdminMenuContextProvider>
    </MockSessionProvider>
  )
}

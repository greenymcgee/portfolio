'use client'

import { PropsWithChildren } from 'react'
import { SessionProvider } from 'next-auth/react'
import { ThemeProvider, ThemeProviderProps } from 'next-themes'

import {
  AdminMenuContextProvider,
  type AdminMenuContextType,
} from './adminMenu'

type Props = {
  initialAdminMenuContent?: AdminMenuContextType['content']
  themeProviderProps?: ThemeProviderProps
}

export function ProviderTree({
  children,
  initialAdminMenuContent,
  themeProviderProps,
}: PropsWithChildren<Props>) {
  return (
    <SessionProvider>
      <AdminMenuContextProvider initialContent={initialAdminMenuContent}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          {...themeProviderProps}
        >
          {children}
        </ThemeProvider>
      </AdminMenuContextProvider>
    </SessionProvider>
  )
}

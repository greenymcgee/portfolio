'use client'

import { PropsWithChildren } from 'react'
import { SessionProvider } from 'next-auth/react'

import {
  AdminMenuContextProvider,
  type AdminMenuContextType,
} from './adminMenu'

type Props = {
  initialAdminMenuContent?: AdminMenuContextType['content']
}

export function ProviderTree({
  children,
  initialAdminMenuContent,
}: PropsWithChildren<Props>) {
  return (
    <SessionProvider>
      <AdminMenuContextProvider initialContent={initialAdminMenuContent}>
        {children}
      </AdminMenuContextProvider>
    </SessionProvider>
  )
}

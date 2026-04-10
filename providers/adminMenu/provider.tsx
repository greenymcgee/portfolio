'use client'

import { ReactNode, useState } from 'react'

import { AdminMenuContext } from './context'
import { AdminMenuContextType } from './types'

type Props = {
  children: ReactNode
  initialContent?: AdminMenuContextType['content']
}

export function AdminMenuContextProvider({
  children,
  initialContent = null,
}: Props) {
  const [content, setContent] =
    useState<AdminMenuContextType['content']>(initialContent)

  return (
    <AdminMenuContext.Provider value={{ content, setContent }}>
      {children}
    </AdminMenuContext.Provider>
  )
}

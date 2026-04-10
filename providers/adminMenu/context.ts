'use client'

import { createContext } from 'react'

import { AdminMenuContextType } from './types'

export const AdminMenuContext = createContext<AdminMenuContextType>({
  content: null,
  setContent: () => null,
})

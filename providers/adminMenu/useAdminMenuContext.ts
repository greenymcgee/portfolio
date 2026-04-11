'use client'

import { useContext } from 'react'

import { AdminMenuContext } from './context'

export function useAdminMenuContext() {
  return useContext(AdminMenuContext)
}

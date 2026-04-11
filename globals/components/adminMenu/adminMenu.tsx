'use client'

import { useAdminMenuContext } from '@/providers'

import { AdminMenuDialog } from '../adminMenuDialog'

export function AdminMenu() {
  const { content } = useAdminMenuContext()

  if (!content) return null

  return <AdminMenuDialog content={content} />
}

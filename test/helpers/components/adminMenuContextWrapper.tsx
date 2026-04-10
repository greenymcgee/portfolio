import { PropsWithChildren } from 'react'

import { useAdminMenuContext } from '@/providers'

export function AdminMenuContextWrapper({ children }: PropsWithChildren) {
  const { content } = useAdminMenuContext()
  return (
    <>
      {content}
      {children}
    </>
  )
}

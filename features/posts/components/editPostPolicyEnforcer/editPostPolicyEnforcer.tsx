'use client'

import { useLayoutEffect, useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

import { ROUTES } from '@/globals/constants'
import { hasPermission } from '@/lib/permissions'

export function EditPostPolicyEnforcer() {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const permitted = useMemo(
    () => hasPermission(session?.user, 'posts', 'update'),
    [session?.user],
  )

  useLayoutEffect(() => {
    if (permitted || status === 'loading' || pathname === ROUTES.home) return

    router.push(ROUTES.home)
  }, [pathname, permitted, router, status])

  return null
}

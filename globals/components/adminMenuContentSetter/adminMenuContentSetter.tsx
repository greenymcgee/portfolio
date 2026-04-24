'use client'

import { ReactElement, useLayoutEffect } from 'react'

import { useAdminMenuContext } from '@/providers'

type Props = { content: ReactElement }

export function AdminMenuContentSetter({ content: Content }: Props) {
  const { setContent } = useAdminMenuContext()

  useLayoutEffect(() => {
    setContent(Content)
    return () => {
      setContent(null)
    }
  }, [Content, setContent])

  return null
}

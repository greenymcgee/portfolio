'use client'

import { useLayoutEffect } from 'react'

import { useAdminMenuContext } from '@/providers'

import { PostsAdminMenuContent } from '../adminMenuContent'

export function PostsAdminMenuContentSetter() {
  const { setContent } = useAdminMenuContext()

  useLayoutEffect(() => {
    setContent(<PostsAdminMenuContent />)
    return () => {
      setContent(null)
    }
  }, [setContent])

  return null
}

'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'

import { Button, Switch } from '@/globals/components/ui'
import { ROUTES } from '@/globals/constants'

import { useUnpublishedParam } from '../../hooks'

export function UnpublishedPostsToggle() {
  const unpublished = useUnpublishedParam()
  const router = useRouter()

  const handleChange = useCallback(
    () => router.push(unpublished ? ROUTES.posts : ROUTES.unpublishedPosts),
    [router, unpublished],
  )

  return (
    <>
      <Button asChild variant="ghost">
        <label htmlFor="unpublished-posts-switch">Unpublished</label>
      </Button>{' '}
      <Switch
        aria-label="Toggle unpublished posts"
        checked={unpublished}
        className="align-middle"
        id="unpublished-posts-switch"
        onCheckedChange={handleChange}
      />
    </>
  )
}

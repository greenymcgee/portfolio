'use client'

import { useActionState } from 'react'
import { withCallbacks } from '@greenymcgee/typescript-utils'
import { toast } from 'sonner'

import { Button } from '@/globals/components/ui'
import { Post } from '@/prisma/generated/client'

import { togglePostPublished } from '../../actions'

type Props = { post: Post }

export function TogglePostPublishedForm({ post }: Props) {
  const [, action, pending] = useActionState(
    withCallbacks(togglePostPublished, {
      onError({ publishedAt }) {
        toast.error(
          `Post could not be ${publishedAt ? 'unpublished' : 'published'}`,
        )
      },
      onSuccess() {
        toast.success(`${post.title} has been unpublished`)
      },
    }),
    {
      id: post.id,
      publishedAt: post.publishedAt,
      status: 'IDLE',
    },
  )

  return (
    <form action={action}>
      <Button
        disabled={pending}
        loading={pending}
        type="submit"
        variant={post.publishedAt ? 'outline' : undefined}
      >
        {post.publishedAt ? 'Unpublish' : 'Publish'}
      </Button>
    </form>
  )
}

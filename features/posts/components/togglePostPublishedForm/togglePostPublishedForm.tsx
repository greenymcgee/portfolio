'use client'

import { useActionState } from 'react'
import { withCallbacks } from '@greenymcgee/typescript-utils'
import { toast } from 'sonner'

import { Button, Spinner } from '@/globals/components/ui'
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
      {post.publishedAt ? (
        <Button disabled={pending} type="submit" variant="outline">
          Unpublish {pending ? <Spinner /> : null}
        </Button>
      ) : (
        <Button disabled={pending} type="submit">
          Publish {pending ? <Spinner /> : null}
        </Button>
      )}
    </form>
  )
}

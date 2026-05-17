'use client'

import { useActionState } from 'react'
import { withCallbacks } from '@greenymcgee/typescript-utils'
import { CirclePlus, Pencil, Trash2Icon } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

import { Button, Spinner } from '@/globals/components/ui'
import { ROUTES } from '@/globals/constants'

import { deletePost } from '../../actions'
import { DeletePostState } from '../../types'

type Props = { post: AuthoredPost }

export function PostPageAdminMenuContent({ post }: Props) {
  const [, action, deletingPost] = useActionState(
    withCallbacks(deletePost, {
      onError() {
        toast.error('Post could not be deleted')
      },
    }),
    { id: post.id, status: 'IDLE' } as DeletePostState,
  )

  return (
    <nav className="space-y-2" data-testid="post-page-admin-menu-content">
      <div>
        <Button asChild className="justify-start" variant="ghost">
          <Link href={ROUTES.newPost}>
            <CirclePlus
              aria-hidden
              className="inline h-[1em] w-[1em] align-middle"
            />{' '}
            <span className="align-middle">New Post</span>
          </Link>
        </Button>
      </div>
      <div>
        <Button asChild className="justify-start" variant="ghost">
          <Link
            aria-label={`Edit ${post.title}`}
            href={ROUTES.editPost(post.id)}
          >
            <Pencil
              aria-hidden
              className="inline h-[1em] w-[1em] align-middle"
            />{' '}
            <span className="align-middle">Edit</span>
          </Link>
        </Button>
      </div>
      <form action={action}>
        <Button
          aria-label={`Delete ${post.title}`}
          className="justify-start"
          disabled={deletingPost}
          type="submit"
          variant="destructive"
        >
          <Trash2Icon aria-hidden /> Delete {deletingPost ? <Spinner /> : null}
        </Button>
      </form>
    </nav>
  )
}

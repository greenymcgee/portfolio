'use client'

import { useActionState } from 'react'
import { withCallbacks } from '@greenymcgee/typescript-utils'
import { CirclePlus } from 'lucide-react'
import { toast } from 'sonner'

import { Button, Spinner } from '@/globals/components/ui'

import { createPost } from '../../actions'

export function NewPostForm() {
  const [, action, pending] = useActionState(
    withCallbacks(createPost, {
      onError() {
        toast.error('Something went wrong')
      },
    }),
    { status: 'IDLE' },
  )

  return (
    <form action={action} data-testid="new-post-form">
      <Button
        className="w-full justify-start"
        disabled={pending}
        type="submit"
        variant="ghost"
      >
        <CirclePlus
          aria-hidden
          className="inline h-[1em] w-[1em] align-middle"
          data-icon="inline-start"
        />{' '}
        <span className="align-middle">New Post</span>
        {pending ? <Spinner /> : null}
      </Button>
    </form>
  )
}

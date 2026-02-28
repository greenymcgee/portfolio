'use client'

import { useActionState, useLayoutEffect, useMemo, useState } from 'react'
import { withCallbacks } from '@greenymcgee/typescript-utils'
import Form from 'next/form'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

import { ROUTES } from '@/constants'
import { createPost } from '@/features/posts/server'
import { hasPermission } from '@/lib/permissions'

import { CreatePostFormBody } from '../createPostFormBody'

export function CreatePostForm() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [errorMessage, setErrorMessage] = useState('')
  const [state, action, pending] = useActionState(
    withCallbacks(createPost, {
      onError: () => setErrorMessage('Something went wrong'),
    }),
    { status: 'IDLE' },
  )
  const permitted = useMemo(
    () => hasPermission(session?.user, 'posts', 'create'),
    [session?.user],
  )

  useLayoutEffect(() => {
    if (permitted || status === 'loading' || pathname === ROUTES.home) return

    router.push(ROUTES.home)
  }, [pathname, permitted, router, status])

  return (
    <Form action={action} className="space-y-6" data-testid="create-post-form">
      <CreatePostFormBody
        defaultContent={state.content}
        defaultTitle={state.title}
        errorMessage={errorMessage}
        pending={pending}
      />
    </Form>
  )
}

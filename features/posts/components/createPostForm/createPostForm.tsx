'use client'

import {
  useActionState,
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react'
import { withCallbacks } from '@greenymcgee/typescript-utils'
import Form from 'next/form'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

import { createPost } from '@/features/posts/server'
import { ROUTES } from '@/globals/constants'
import { hasPermission } from '@/lib/permissions'

import { CreatePostFormBody } from '../createPostFormBody'

export function CreatePostForm() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [errorMessage, setErrorMessage] = useState('')
  // TODO: need to prevent saving when content is empty
  // this will require some lexical help
  // issue #94
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
  const [content, setContent] = useState(state.content as string | null)

  const handleContentChange = useCallback<
    PropsOf<typeof CreatePostFormBody>['onContentChange']
  >((editorState) => {
    setContent(JSON.stringify(editorState.toJSON()))
  }, [])

  useLayoutEffect(() => {
    if (permitted || status === 'loading' || pathname === ROUTES.home) return

    router.push(ROUTES.home)
  }, [pathname, permitted, router, status])

  return (
    <Form action={action} className="space-y-6" data-testid="create-post-form">
      <CreatePostFormBody
        content={content}
        defaultTitle={state.title}
        errorMessage={errorMessage}
        onContentChange={handleContentChange}
        pending={pending}
      />
    </Form>
  )
}

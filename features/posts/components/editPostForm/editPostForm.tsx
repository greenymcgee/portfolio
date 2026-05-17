'use client'

import { useActionState, useCallback, useRef } from 'react'
import type { EditorState } from 'lexical'

import { updatePost } from '@/features/posts/actions'
import { LegacyRichTextEditor } from '@/globals/components'
import type { Post } from '@/prisma/generated/client'

import { EditPostStatus } from '../editPostStatus'
import {
  autosavePost,
  handleEditPostFormSubmit,
  updateContentField,
} from './utils'

interface Props {
  post: Post
}

export function EditPostForm({ post }: Props) {
  const formRef = useRef<HTMLFormElement>(null)
  const contentRef = useRef<HTMLInputElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [state, updateAction, saving] = useActionState(updatePost, {
    content: typeof post.content === 'string' ? post.content : '',
    status: 'IDLE',
    title: post.title,
  })
  const initialContent =
    typeof state?.content === 'string' ? state.content : undefined

  const handleFieldChange = useCallback(
    () => autosavePost({ formRef, timeoutRef, updateAction }),
    [updateAction],
  )

  const handleContentChange = useCallback(
    (editorState: EditorState) => {
      updateContentField({
        contentRef,
        editorState,
        fieldChangeCallback: handleFieldChange,
      })
    },
    [handleFieldChange],
  )

  return (
    <form
      className="mx-auto max-w-3xl px-6"
      data-testid="edit-post-form"
      onSubmit={handleEditPostFormSubmit}
      ref={formRef}
    >
      <div className="mb-3">
        <EditPostStatus saving={saving} status={state?.status} />
      </div>
      <input
        data-testid="description-input"
        name="description"
        type="hidden"
        value={post.description}
      />
      <input data-testid="id-input" name="id" type="hidden" value={post.id} />
      <input
        data-testid="content-input"
        defaultValue={initialContent}
        name="content"
        ref={contentRef}
        type="hidden"
      />
      <div className="mb-8">
        <input
          aria-label="Title"
          className="w-full text-xl font-medium"
          data-testid="title-input"
          defaultValue={typeof state?.title === 'string' ? state.title : ''}
          name="title"
          onChange={handleFieldChange}
          type="text"
        />
      </div>
      <LegacyRichTextEditor
        editing
        initialState={initialContent}
        onChange={handleContentChange}
      />
    </form>
  )
}

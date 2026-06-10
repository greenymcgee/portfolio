'use client'

import { useActionState, useCallback, useRef } from 'react'
import clsx from 'clsx'
import type { EditorState } from 'lexical'

import {
  RichTextContent,
  RichTextEditor,
  RichTextToolbar,
} from '@/globals/components'

import { autosavePost } from '../../actions'
import { EditPostStatus } from '../editPostStatus'
import { EditPostTitleError } from '../editPostTitleError'
import {
  debounceAutosave,
  handleEditPostFormSubmit,
  updateContentField,
} from './utils'

interface Props {
  post: AuthoredPost
}

export function EditPostForm({ post }: Props) {
  const formRef = useRef<HTMLFormElement>(null)
  const contentRef = useRef<HTMLInputElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initialContent =
    typeof post.content === 'string' ? post.content : undefined
  const [state, updateAction, saving] = useActionState(autosavePost, {
    content: initialContent,
    status: 'IDLE',
    title: post.title,
  })

  const handleFieldChange = useCallback(
    () => debounceAutosave({ formRef, timeoutRef, updateAction }),
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
    <RichTextEditor
      editing
      initialState={initialContent}
      onChange={handleContentChange}
    >
      <div
        className={clsx(
          'full-bleed-bg bg-background sticky top-0 left-0 z-10 mb-20',
          'flex items-center justify-between',
        )}
      >
        <RichTextToolbar />
        <EditPostStatus
          saving={saving}
          status={state?.status}
          updatedAt={post.updatedAt}
        />
      </div>
      <form
        className="mx-auto max-w-3xl px-6"
        data-testid="edit-post-form"
        onSubmit={handleEditPostFormSubmit}
        ref={formRef}
      >
        <input
          data-testid="description-input"
          name="description"
          type="hidden"
          value={post.description}
        />
        <input data-testid="id-input" name="id" type="hidden" value={post.id} />
        <input
          data-testid="content-input"
          defaultValue={
            typeof state?.content === 'string' ? state.content : initialContent
          }
          name="content"
          ref={contentRef}
          type="hidden"
        />
        <div className="mb-8 space-y-1">
          <EditPostTitleError state={state} />
          <input
            aria-label="Title"
            className={clsx(
              'w-full rounded text-xl font-medium',
              'invalid:border-destructive invalid:border',
              'focus-visible:shadow-none focus-visible:outline-none',
            )}
            data-testid="title-input"
            defaultValue={typeof state?.title === 'string' ? state.title : ''}
            name="title"
            onChange={handleFieldChange}
            required
            type="text"
          />
        </div>
        <p className="text-subtle mb-8 text-xs">
          By {post.author.firstName} {post.author.lastName}
        </p>
        <RichTextContent />
      </form>
    </RichTextEditor>
  )
}

import { Suspense } from 'react'

import { RichTextEditor } from '@/globals/components'
import { Button, Spinner } from '@/globals/components/ui'

type Props = {
  content: string | null
  defaultDescription: FormDataEntryValue | null | undefined
  defaultTitle: FormDataEntryValue | null | undefined
  errorMessage: string
  onContentChange: NonNullable<PropsOf<typeof RichTextEditor>['onChange']>
  pending: boolean
}

export function CreatePostFormBody({
  content,
  defaultDescription,
  defaultTitle,
  errorMessage,
  onContentChange,
  pending,
}: Props) {
  return (
    <>
      {errorMessage ? (
        <p
          aria-live="polite"
          className="mb-4 text-red-500"
          data-testid="error-message"
        >
          {errorMessage}
        </p>
      ) : null}
      <div>
        <label className="mb-2 text-lg font-medium" htmlFor="title">
          Title
        </label>
        <input
          className="w-full rounded-lg border px-4 py-2"
          defaultValue={defaultTitle ? String(defaultTitle) : ''}
          id="title"
          name="title"
          type="text"
        />
      </div>
      <div>
        <label className="mb-2 text-lg font-medium" htmlFor="description">
          Description
        </label>
        <textarea
          className="w-full rounded-lg border px-4 py-2"
          defaultValue={defaultDescription ? String(defaultDescription) : ''}
          id="description"
          maxLength={100}
          name="description"
        />
      </div>
      <div>
        <label className="mb-2 block text-lg font-medium" htmlFor="content">
          Content
        </label>
        <input
          id="content"
          name="content"
          type="hidden"
          value={content ?? ''}
        />
        <Suspense>
          <RichTextEditor
            data-testid="content-editor"
            editing
            initialState={content}
            onChange={onContentChange}
          />
        </Suspense>
      </div>
      <Button
        aria-live="polite"
        className="ml-auto block"
        data-testid="submit-post-button"
        disabled={pending}
        size="lg"
        type="submit"
      >
        Create Post{' '}
        {pending ? <Spinner className="inline" data-icon="inline-end" /> : null}
      </Button>
    </>
  )
}

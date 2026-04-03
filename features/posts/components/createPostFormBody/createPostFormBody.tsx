import { Suspense } from 'react'
import clsx from 'clsx'

import { RichTextEditor } from '@/globals/components'

type Props = {
  content: string | null
  defaultTitle: FormDataEntryValue | null | undefined
  errorMessage: string
  onContentChange: NonNullable<PropsOf<typeof RichTextEditor>['onChange']>
  pending: boolean
}

export function CreatePostFormBody({
  content,
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
          Title{' '}
          <span aria-label="Required" className="">
            *
          </span>
        </label>
        <input
          className="w-full rounded-lg border px-4 py-2"
          defaultValue={defaultTitle ? String(defaultTitle) : undefined}
          id="title"
          name="title"
          required
          type="text"
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
      <button
        className={clsx(
          'bg-primary text-on-primary w-full cursor-pointer rounded-lg py-3 font-semibold',
          'transition-[background-color,box-shadow,opacity,outline]',
          'hover:bg-primary/80 focus-visible:bg-primary/80 disabled:opacity-60',
        )}
        data-testid="submit-post-button"
        disabled={pending}
        type="submit"
      >
        Create Post
      </button>
    </>
  )
}

import clsx from 'clsx'

type Props = {
  defaultContent: FormDataEntryValue | null | undefined
  defaultTitle: FormDataEntryValue | null | undefined
  errorMessage: string
  pending: boolean
}

export function CreatePostFormBody({
  defaultContent,
  defaultTitle,
  errorMessage,
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
        <label
          className="mb-2 flex items-center text-lg font-medium"
          htmlFor="title"
        >
          Title
          <span className="ml-2 rounded-lg bg-gray-500 px-2 py-1 text-xs font-semibold text-white">
            Required
          </span>
        </label>
        <input
          className="w-full rounded-lg border px-4 py-2"
          defaultValue={defaultTitle ? String(defaultTitle) : undefined}
          id="title"
          name="title"
          placeholder="Great things await ..."
          required
          type="text"
        />
      </div>
      <div>
        <label className="mb-2 block text-lg font-medium" htmlFor="content">
          Content
        </label>
        <textarea
          className="w-full rounded-lg border px-4 py-2"
          defaultValue={defaultContent ? String(defaultContent) : undefined}
          id="content"
          name="content"
          placeholder="Just start writing ..."
          rows={6}
        />
      </div>
      <button
        className={clsx(
          'w-full rounded-lg bg-blue-500 py-3 text-white hover:bg-blue-600',
          { 'opacity-80': pending },
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

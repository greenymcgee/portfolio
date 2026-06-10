import { UpdatePostState } from '../../types'

type Props = { state: UpdatePostState | undefined }

export function EditPostTitleError({ state }: Props) {
  if (!state) return null

  const { dtoError, threwUniqueConstraintError } = state
  return (
    <>
      {threwUniqueConstraintError ? (
        <p
          className="text-destructive text-sm"
          data-testid="unique-constraint-error"
        >
          That title has already been taken
        </p>
      ) : null}
      {dtoError?.fieldErrors.title ? (
        <div
          className="text-destructive space-y-1 text-sm"
          data-testid="dto-title-error"
        >
          <p>The title must meet the following requirements:</p>
          <ul className="list-disc space-y-1 pl-6">
            {dtoError.fieldErrors.title.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </>
  )
}

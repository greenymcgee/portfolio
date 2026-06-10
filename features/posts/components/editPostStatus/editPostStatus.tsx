import type { ActionState } from '@greenymcgee/typescript-utils'
import { formatDistanceToNow } from 'date-fns'

import { Spinner } from '@/globals/components/ui'

type Props = {
  saving: boolean
  status: ActionState['status']
  updatedAt: AuthoredPost['updatedAt']
}

export function EditPostStatus({ saving, status, updatedAt }: Props) {
  if (saving) {
    return (
      <p className="text-subtle text-xs">
        <span className="opacity-70">Saving...</span>{' '}
        <Spinner className="inline" data-icon="inline-end" />
      </p>
    )
  }

  if (status === 'IDLE') {
    return (
      <p className="text-subtle text-xs" data-testid="edit-post-saved-status">
        Edited {formatDistanceToNow(updatedAt, { addSuffix: true })}
      </p>
    )
  }

  if (status === 'ERROR') {
    return (
      <p
        className="text-destructive text-xs"
        data-testid="edit-post-save-error"
      >
        Unable to save...
      </p>
    )
  }

  return <p className="text-subtle text-xs">Saved</p>
}

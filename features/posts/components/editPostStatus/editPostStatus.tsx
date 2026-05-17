import type { ActionState } from '@greenymcgee/typescript-utils'

import { Spinner } from '@/globals/components/ui'

type Props = { saving: boolean; status: ActionState['status'] }

export function EditPostStatus({ saving, status }: Props) {
  if (status === 'IDLE' && !saving) return null

  if (saving) {
    return (
      <p className="text-right">
        <span className="opacity-70">Saving...</span>{' '}
        <Spinner className="inline" data-icon="inline-end" />
      </p>
    )
  }

  if (status === 'ERROR') {
    return <p className="text-destructive">Unable to save</p>
  }

  return <p className="text-right">Saved</p>
}

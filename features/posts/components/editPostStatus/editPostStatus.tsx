import type { ActionState } from '@greenymcgee/typescript-utils'
import clsx from 'clsx'

import { Spinner } from '@/globals/components/ui'

type Props = { saving: boolean; status: ActionState['status'] }

export function EditPostStatus({ saving, status }: Props) {
  if (status === 'IDLE' && !saving) return null

  if (status === 'ERROR') {
    return <p className="text-destructive">Unable to save</p>
  }

  return (
    <p className="text-right">
      <span className={clsx({ 'opacity-70': saving })}>
        {saving ? 'Saving...' : 'Saved'}
      </span>{' '}
      {saving ? <Spinner className="inline" data-icon="inline-end" /> : null}
    </p>
  )
}

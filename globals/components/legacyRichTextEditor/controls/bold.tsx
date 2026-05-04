import clsx from 'clsx'
import { Bold } from 'lucide-react'

import { ACTIVE_BUTTON_CLASS, BUTTON_CLASS, ICON_SIZE } from '../constants'

type Props = { handleBoldClicked: VoidFunction; isBold: boolean }

export function BoldControl({ handleBoldClicked, isBold }: Props) {
  return (
    <button
      aria-label="Format Bold"
      className={clsx(BUTTON_CLASS, isBold && ACTIVE_BUTTON_CLASS)}
      onClick={handleBoldClicked}
      type="button"
    >
      <Bold size={ICON_SIZE} />
    </button>
  )
}

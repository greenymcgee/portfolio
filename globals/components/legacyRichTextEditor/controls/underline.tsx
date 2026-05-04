import clsx from 'clsx'
import { Underline } from 'lucide-react'

import { ACTIVE_BUTTON_CLASS, BUTTON_CLASS, ICON_SIZE } from '../constants'

type Props = { handleUnderlineClicked: VoidFunction; isUnderline: boolean }

export function UnderlineControl({
  handleUnderlineClicked,
  isUnderline,
}: Props) {
  return (
    <button
      aria-label="Format Underline"
      className={clsx(BUTTON_CLASS, isUnderline && ACTIVE_BUTTON_CLASS)}
      onClick={handleUnderlineClicked}
      type="button"
    >
      <Underline size={ICON_SIZE} />
    </button>
  )
}

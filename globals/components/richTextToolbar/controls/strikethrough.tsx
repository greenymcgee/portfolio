import clsx from 'clsx'
import { Strikethrough } from 'lucide-react'

import { ACTIVE_BUTTON_CLASS, BUTTON_CLASS, ICON_SIZE } from '../constants'

type Props = {
  handleStrikethroughClicked: VoidFunction
  isStrikethrough: boolean
}

export function StrikethroughControl({
  handleStrikethroughClicked,
  isStrikethrough,
}: Props) {
  return (
    <button
      aria-label="Format Strikethrough"
      className={clsx(BUTTON_CLASS, isStrikethrough && ACTIVE_BUTTON_CLASS)}
      onClick={handleStrikethroughClicked}
      type="button"
    >
      <Strikethrough size={ICON_SIZE} />
    </button>
  )
}

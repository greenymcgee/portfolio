import { AlignJustify } from 'lucide-react'

import { BUTTON_CLASS, ICON_SIZE } from '../constants'

type Props = { handleJustifyAlignClicked: VoidFunction }

export function AlignJustifyControl({ handleJustifyAlignClicked }: Props) {
  return (
    <button
      aria-label="Justify Align"
      className={BUTTON_CLASS}
      onClick={handleJustifyAlignClicked}
      type="button"
    >
      <AlignJustify size={ICON_SIZE} />
    </button>
  )
}

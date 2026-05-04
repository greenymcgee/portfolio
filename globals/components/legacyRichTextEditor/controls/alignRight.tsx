import { AlignRight } from 'lucide-react'

import { BUTTON_CLASS, ICON_SIZE } from '../constants'

type Props = { handleRightAlignClicked: VoidFunction }

export function AlignRightControl({ handleRightAlignClicked }: Props) {
  return (
    <button
      aria-label="Right Align"
      className={BUTTON_CLASS}
      onClick={handleRightAlignClicked}
      type="button"
    >
      <AlignRight size={ICON_SIZE} />
    </button>
  )
}

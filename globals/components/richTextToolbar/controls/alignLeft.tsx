import { AlignLeft } from 'lucide-react'

import { BUTTON_CLASS, ICON_SIZE } from '../constants'

type Props = { handleLeftAlignClicked: VoidFunction }

export function AlignLeftControl({ handleLeftAlignClicked }: Props) {
  return (
    <button
      aria-label="Left Align"
      className={BUTTON_CLASS}
      onClick={handleLeftAlignClicked}
      type="button"
    >
      <AlignLeft size={ICON_SIZE} />
    </button>
  )
}

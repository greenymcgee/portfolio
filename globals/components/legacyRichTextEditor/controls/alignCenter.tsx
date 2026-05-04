import { AlignCenter } from 'lucide-react'

import { BUTTON_CLASS, ICON_SIZE } from '../constants'

type Props = { handleCenterAlignClicked: VoidFunction }

export function AlignCenterControl({ handleCenterAlignClicked }: Props) {
  return (
    <button
      aria-label="Center Align"
      className={BUTTON_CLASS}
      onClick={handleCenterAlignClicked}
      type="button"
    >
      <AlignCenter size={ICON_SIZE} />
    </button>
  )
}

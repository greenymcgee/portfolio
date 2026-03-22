import clsx from 'clsx'
import { Italic } from 'lucide-react'

import { ACTIVE_BUTTON_CLASS, BUTTON_CLASS, ICON_SIZE } from '../constants'

type Props = { handleItalicClicked: VoidFunction; isItalic: boolean }

export function ItalicControl({ handleItalicClicked, isItalic }: Props) {
  return (
    <button
      aria-label="Format Italics"
      className={clsx(BUTTON_CLASS, isItalic && ACTIVE_BUTTON_CLASS)}
      onClick={handleItalicClicked}
      type="button"
    >
      <Italic size={ICON_SIZE} />
    </button>
  )
}

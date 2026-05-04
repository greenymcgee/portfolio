import { Undo } from 'lucide-react'

import { BUTTON_CLASS, ICON_SIZE } from '../constants'

type Props = { canUndo: boolean; handleUndoClicked: VoidFunction }

export function UndoControl({ canUndo, handleUndoClicked }: Props) {
  return (
    <button
      aria-label="Undo"
      className={BUTTON_CLASS}
      disabled={!canUndo}
      onClick={handleUndoClicked}
      type="button"
    >
      <Undo size={ICON_SIZE} />
    </button>
  )
}

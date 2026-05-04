import { Redo } from 'lucide-react'

import { BUTTON_CLASS, ICON_SIZE } from '../constants'

type Props = { canRedo: boolean; handleRedoClicked: VoidFunction }

export function RedoControl({ canRedo, handleRedoClicked }: Props) {
  return (
    <button
      aria-label="Redo"
      className={BUTTON_CLASS}
      disabled={!canRedo}
      onClick={handleRedoClicked}
      type="button"
    >
      <Redo size={ICON_SIZE} />
    </button>
  )
}

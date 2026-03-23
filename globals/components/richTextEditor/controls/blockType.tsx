import { ChangeEvent } from 'react'
import { ChevronDown } from 'lucide-react'

import { BLOCK_TYPE_LABELS } from '../constants'
import { BlockType } from '../types'

type Props = {
  blockType: BlockType
  handleBlockTypeChange: (event: ChangeEvent<HTMLSelectElement>) => void
}

export function BlockTypeControl({ blockType, handleBlockTypeChange }: Props) {
  return (
    <div className="relative">
      <select
        aria-label="Block type"
        className="hover:bg-foreground hover:text-background text-foreground cursor-pointer appearance-none rounded py-1 pr-7 pl-2 text-sm"
        onChange={handleBlockTypeChange}
        value={blockType}
      >
        {Object.entries(BLOCK_TYPE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-1 -translate-y-1/2 text-gray-400"
        size={14}
      />
    </div>
  )
}

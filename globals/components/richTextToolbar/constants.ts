import clsx from 'clsx'

import { RichTextBlockType } from '@/types/rich-text-block-type'

export const ICON_SIZE = 18

export const BUTTON_CLASS = clsx(
  'cursor-pointer rounded p-2 hover:bg-foreground',
  'hover:text-gray-700 disabled:text-gray-700 disabled:hover:bg-transparent disabled:cursor-auto',
)
export const ACTIVE_BUTTON_CLASS = 'bg-foreground text-background'

export const BLOCK_TYPE_LABELS: Record<RichTextBlockType, string> = {
  h2: 'Heading 2',
  h3: 'Heading 3',
  h4: 'Heading 4',
  h5: 'Heading 5',
  h6: 'Heading 6',
  paragraph: 'Normal',
}

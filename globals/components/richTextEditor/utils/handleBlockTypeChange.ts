import { ChangeEvent } from 'react'
import { $createHeadingNode } from '@lexical/rich-text'
import { $setBlocksType } from '@lexical/selection'
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  LexicalEditor,
} from 'lexical'

import { BlockType } from '../types'

export function handleBlockTypeChange(editor: LexicalEditor) {
  return (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as BlockType
    editor.update(() => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) return

      if (value === 'paragraph') {
        $setBlocksType(selection, () => $createParagraphNode())
        return
      }

      $setBlocksType(selection, () => $createHeadingNode(value))
    })
  }
}

import { ChangeEvent } from 'react'
import { $createHeadingNode } from '@lexical/rich-text'
import { $setBlocksType } from '@lexical/selection'
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  LexicalEditor,
} from 'lexical'

import { RichTextBlockType } from '@/types/rich-text-block-type'

export function handleBlockTypeChange(editor: LexicalEditor) {
  return (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as RichTextBlockType
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

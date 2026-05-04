import { Dispatch, SetStateAction } from 'react'
import { $isHeadingNode, HeadingNode } from '@lexical/rich-text'
import {
  $getSelection,
  $isRangeSelection,
  LexicalNode,
  RangeSelection,
} from 'lexical'

import { BlockType } from '../types'

type Params = {
  setBlockType: Dispatch<SetStateAction<BlockType>>
  setIsBold: Dispatch<SetStateAction<boolean>>
  setIsItalic: Dispatch<SetStateAction<boolean>>
  setIsUnderline: Dispatch<SetStateAction<boolean>>
  setIsStrikethrough: Dispatch<SetStateAction<boolean>>
}

function getTopElement(selection: RangeSelection) {
  const anchorNode = selection.anchor.getNode()
  if (anchorNode.getKey() === 'root') return anchorNode

  return anchorNode.getTopLevelElementOrThrow()
}

function getHeadingTag(
  node: HeadingNode,
  setBlockType: Params['setBlockType'],
) {
  const tag = node.getTag()
  if (tag === 'h1') return

  setBlockType(tag)
}

function handleBlockTypeChange(
  node: LexicalNode,
  setBlockType: Params['setBlockType'],
) {
  if ($isHeadingNode(node)) return getHeadingTag(node, setBlockType)

  setBlockType('paragraph')
}

export function updateToolbar({
  setBlockType,
  setIsBold,
  setIsItalic,
  setIsStrikethrough,
  setIsUnderline,
}: Params) {
  const selection = $getSelection()
  if (!$isRangeSelection(selection)) return

  handleBlockTypeChange(getTopElement(selection), setBlockType)
  setIsBold(selection.hasFormat('bold'))
  setIsItalic(selection.hasFormat('italic'))
  setIsUnderline(selection.hasFormat('underline'))
  setIsStrikethrough(selection.hasFormat('strikethrough'))
}

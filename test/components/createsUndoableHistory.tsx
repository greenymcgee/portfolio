import { useEffect } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $isParagraphNode,
  $isTextNode,
  LexicalEditor,
} from 'lexical'

import { FIRST_PARAGRAPH_TEXT, SECOND_PARAGRAPH_TEXT } from '../fixtures'

type Props = {
  onReady: (editor: LexicalEditor) => void
}

export function CreatesUndoableHistory({ onReady }: Props) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    editor.update(() => {
      const root = $getRoot()
      root.clear()
      const paragraph = $createParagraphNode()
      paragraph.append($createTextNode(FIRST_PARAGRAPH_TEXT))
      root.append(paragraph)
    })
    setTimeout(() => {
      editor.update(() => {
        const root = $getRoot()
        const paragraph = root.getFirstChildOrThrow()
        if (!$isParagraphNode(paragraph)) {
          throw new Error('expected paragraph')
        }

        const text = paragraph.getFirstChildOrThrow()
        if (!$isTextNode(text)) {
          throw new Error('expected text node')
        }

        text.setTextContent(SECOND_PARAGRAPH_TEXT)
      })
      onReady(editor)
    }, 0)
  }, [editor, onReady])

  return null
}

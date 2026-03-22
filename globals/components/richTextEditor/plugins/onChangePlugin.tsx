import { useEffect } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { EditorState } from 'lexical'

type Props = { onChange: (state: EditorState) => void }

export function OnChangePlugin({ onChange }: Props) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      onChange(editorState)
    })
  }, [editor, onChange])

  return null
}

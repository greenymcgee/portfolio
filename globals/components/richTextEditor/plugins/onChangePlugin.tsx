import { OnChangePlugin as LexicalOnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { EditorState } from 'lexical'

type Props = { onChange: (state: EditorState) => void }

export function OnChangePlugin({ onChange }: Props) {
  return (
    <LexicalOnChangePlugin
      ignoreSelectionChange
      onChange={(editorState) => {
        onChange(editorState)
      }}
    />
  )
}

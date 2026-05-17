import type { EditorState } from 'lexical'
import type { RefObject } from 'react'

type Params = {
  contentRef: RefObject<HTMLInputElement | null>
  editorState: EditorState
  fieldChangeCallback: VoidFunction
}

export function updateContentField({
  contentRef,
  editorState,
  fieldChangeCallback,
}: Params) {
  if (!contentRef.current) return

  contentRef.current.value = JSON.stringify(editorState.toJSON())
  fieldChangeCallback()
}

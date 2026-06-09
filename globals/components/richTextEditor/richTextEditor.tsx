'use client'

import { PropsWithChildren } from 'react'
import {
  InitialConfigType,
  LexicalComposer,
} from '@lexical/react/LexicalComposer'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { EditorState } from 'lexical'

import { BLOG_EDITOR_CONFIG } from '@/lib/lexical'

type Props = PropsWithChildren<{
  editing?: boolean
  initialState?: string | null
  onChange?: (state: EditorState) => void
}>

export function RichTextEditor({
  children,
  editing,
  initialState,
  onChange,
}: Props) {
  const initialConfig: InitialConfigType = {
    ...BLOG_EDITOR_CONFIG,
    editable: Boolean(onChange) && editing,
    editorState: initialState,
    theme: {
      heading: {
        h2: 'mb-2 text-lg md:text-xl leading-md font-semibold',
        h3: 'mb-2 text-md md:text-lg leading-md font-semibold',
        h4: 'mb-2 leading-md font-semibold',
        h5: 'mb-2 leading-md font-semibold',
        h6: 'mb-2 leading-md font-semibold',
      },
      text: {
        bold: 'font-bold',
        italic: 'italic',
        strikethrough: 'line-through',
        underline: 'underline',
      },
    },
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      {editing && onChange ? (
        <OnChangePlugin
          ignoreSelectionChange
          onChange={(editorState) => onChange(editorState)}
        />
      ) : null}
      <HistoryPlugin />
      {children}
    </LexicalComposer>
  )
}

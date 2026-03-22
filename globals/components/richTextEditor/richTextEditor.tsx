'use client'

import { HTMLAttributes, useState } from 'react'
import {
  InitialConfigType,
  LexicalComposer,
} from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { HeadingNode } from '@lexical/rich-text'
import clsx from 'clsx'

import { OnChangePlugin, ToolbarPlugin } from './plugins'

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  editing?: boolean
  initialState?: string | null
  onChange?: PropsOf<typeof OnChangePlugin>['onChange']
}

export function RichTextEditor({
  editing,
  initialState,
  onChange,
  ...options
}: Props) {
  const [error, setError] = useState('')
  const initialConfig: InitialConfigType = {
    editable: Boolean(onChange),
    editorState: initialState ?? null,
    namespace: 'blog',
    nodes: [HeadingNode],
    /* v8 ignore start */
    onError: () => setError('Something went wrong'),
    /* v8 ignore stop */
    theme: {
      heading: {
        h2: 'mb-2 text-lg md:text-xl leading-md font-bold',
        h3: 'mb-2 text-md md:text-lg leading-md font-bold',
        h4: 'mb-2 leading-md font-bold',
        h5: 'mb-2 leading-md font-bold',
        h6: 'mb-2 leading-md font-bold',
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
    <div {...options}>
      {/* v8 ignore start */}
      {error ? (
        <p className="text-red-500">
          <b>{error}</b>
        </p>
      ) : null}
      {/* v8 ignore stop */}
      <LexicalComposer initialConfig={initialConfig}>
        <div className={clsx('relative', { 'rounded-lg border': editing })}>
          {editing && onChange ? (
            <>
              <OnChangePlugin onChange={onChange} />
              <ToolbarPlugin />
            </>
          ) : null}
          <RichTextPlugin
            ErrorBoundary={LexicalErrorBoundary}
            contentEditable={
              <ContentEditable
                aria-placeholder={'Enter some rich text...'}
                className={clsx({
                  'min-h-[200px] px-4 py-3 focus:outline-none': editing,
                })}
                placeholder={
                  <div className="text-subtle pointer-events-none absolute top-[2.7rem] px-4 py-3">
                    Enter some rich text...
                  </div>
                }
              />
            }
          />
          <HistoryPlugin />
        </div>
      </LexicalComposer>
    </div>
  )
}

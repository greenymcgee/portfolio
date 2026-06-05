'use client'

import { HTMLAttributes } from 'react'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import clsx from 'clsx'

type Props = HTMLAttributes<HTMLDivElement>

export function RichTextContent({ ...options }: Props) {
  return (
    <div {...options}>
      <RichTextPlugin
        ErrorBoundary={LexicalErrorBoundary}
        contentEditable={
          <ContentEditable
            className={clsx(
              'focus-visible:border-none focus-visible:shadow-none',
              'focus-visible:outline-none',
            )}
          />
        }
      />
    </div>
  )
}

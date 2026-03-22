import { PropsWithChildren } from 'react'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'

import { TEST_LEXICAL_CONFIG } from '../fixtures'
import { CreatesUndoableHistory } from './createsUndoableHistory'

interface Props extends PropsWithChildren {
  onUndoableHistoryReady?: PropsOf<typeof CreatesUndoableHistory>['onReady']
}

export function LexicalToolbarWrapper({
  children,
  onUndoableHistoryReady,
}: Props) {
  return (
    <LexicalComposer initialConfig={TEST_LEXICAL_CONFIG}>
      <HistoryPlugin delay={0} />
      {onUndoableHistoryReady ? (
        <CreatesUndoableHistory onReady={onUndoableHistoryReady} />
      ) : null}
      {children}
      <RichTextPlugin
        ErrorBoundary={LexicalErrorBoundary}
        contentEditable={
          <ContentEditable
            aria-placeholder="Enter some rich text..."
            placeholder={<div>Enter some rich text...</div>}
          />
        }
        placeholder={<div>Enter some rich text...</div>}
      />
    </LexicalComposer>
  )
}

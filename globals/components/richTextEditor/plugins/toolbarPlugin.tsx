import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { mergeRegister } from '@lexical/utils'
import {
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_LOW,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from 'lexical'

import {
  AlignCenterControl,
  AlignJustifyControl,
  AlignLeftControl,
  AlignRightControl,
  BlockTypeControl,
  BoldControl,
  ItalicControl,
  RedoControl,
  StrikethroughControl,
  UnderlineControl,
  UndoControl,
} from '../controls'
import { BlockType } from '../types'
import {
  handleBlockTypeChange as handleBlockTypeChangeUtil,
  updateToolbar as updateToolbarUtil,
} from '../utils'

export function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext()
  const toolbarRef = useRef(null)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [blockType, setBlockType] = useState<BlockType>('paragraph')
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [isStrikethrough, setIsStrikethrough] = useState(false)

  const updateToolbar = useCallback(() => {
    updateToolbarUtil({
      setBlockType,
      setIsBold,
      setIsItalic,
      setIsStrikethrough,
      setIsUnderline,
    })
  }, [])

  const handleUndoClicked = useCallback(() => {
    editor.dispatchCommand(UNDO_COMMAND, undefined)
  }, [editor])

  const handleRedoClicked = useCallback(() => {
    editor.dispatchCommand(REDO_COMMAND, undefined)
  }, [editor])

  const handleBoldClicked = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
  }, [editor])

  const handleItalicClicked = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
  }, [editor])

  const handleUnderlineClicked = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
  }, [editor])

  const handleStrikethroughClicked = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
  }, [editor])

  const handleLeftAlignClicked = useCallback(() => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')
  }, [editor])

  const handleCenterAlignClicked = useCallback(() => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')
  }, [editor])

  const handleRightAlignClicked = useCallback(() => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')
  }, [editor])

  const handleJustifyAlignClicked = useCallback(() => {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')
  }, [editor])

  const handleBlockTypeChange = useMemo(
    () => handleBlockTypeChangeUtil(editor),
    [editor],
  )

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(
          () => {
            updateToolbar()
          },
          { editor },
        )
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar()
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload)
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload)
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
    )
  }, [editor, updateToolbar])

  return (
    <div
      className="flex items-center gap-0.5 border-b px-2 py-1"
      data-testid="toolbar-plugin"
      ref={toolbarRef}
    >
      <UndoControl canUndo={canUndo} handleUndoClicked={handleUndoClicked} />
      <RedoControl canRedo={canRedo} handleRedoClicked={handleRedoClicked} />
      <div className="bg-border mx-1 h-6 w-px" />
      <BlockTypeControl
        blockType={blockType}
        handleBlockTypeChange={handleBlockTypeChange}
      />
      <div className="bg-border mx-1 h-6 w-px" />
      <BoldControl handleBoldClicked={handleBoldClicked} isBold={isBold} />
      <ItalicControl
        handleItalicClicked={handleItalicClicked}
        isItalic={isItalic}
      />
      <UnderlineControl
        handleUnderlineClicked={handleUnderlineClicked}
        isUnderline={isUnderline}
      />
      <StrikethroughControl
        handleStrikethroughClicked={handleStrikethroughClicked}
        isStrikethrough={isStrikethrough}
      />
      <div className="bg-border mx-1 h-6 w-px" />
      <AlignLeftControl handleLeftAlignClicked={handleLeftAlignClicked} />
      <AlignCenterControl handleCenterAlignClicked={handleCenterAlignClicked} />
      <AlignRightControl handleRightAlignClicked={handleRightAlignClicked} />
      <AlignJustifyControl
        handleJustifyAlignClicked={handleJustifyAlignClicked}
      />
    </div>
  )
}

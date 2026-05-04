import {
  $createHeadingNode,
  $isHeadingNode,
  HeadingNode,
} from '@lexical/rich-text'
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $isParagraphNode,
  $setSelection,
  createEditor,
  ParagraphNode,
  TextNode,
} from 'lexical'
import type { ChangeEvent } from 'react'

import { handleBlockTypeChange } from '../handleBlockTypeChange'

function createTestEditor() {
  return createEditor({
    namespace: 'handle-block-type-change-test',
    nodes: [HeadingNode, ParagraphNode, TextNode],
    onError: () => {},
  })
}

function createSelectEvent(value: string): ChangeEvent<HTMLSelectElement> {
  return { target: { value } } as ChangeEvent<HTMLSelectElement>
}

/** Lexical commits headless updates on a microtask unless `discrete: true`. */
async function flushLexicalCommit() {
  await Promise.resolve()
}

describe('handleBlockTypeChange', () => {
  it('should do nothing when there is no range selection', async () => {
    const editor = createTestEditor()
    editor.update(
      () => {
        const root = $getRoot()
        root.clear()
        const paragraph = $createParagraphNode()
        const text = $createTextNode('Hello')
        paragraph.append(text)
        root.append(paragraph)
        $setSelection(null)
      },
      { discrete: true },
    )
    const handler = handleBlockTypeChange(editor)
    handler(createSelectEvent('h2'))
    await flushLexicalCommit()
    editor.getEditorState().read(() => {
      const first = $getRoot().getFirstChildOrThrow()
      expect($isParagraphNode(first)).toBe(true)
    })
  })

  it('should set blocks to paragraph when the select value is paragraph', async () => {
    const editor = createTestEditor()
    editor.update(
      () => {
        const root = $getRoot()
        root.clear()
        const heading = $createHeadingNode('h2')
        const text = $createTextNode('Title')
        heading.append(text)
        root.append(heading)
        text.select(0, 5)
      },
      { discrete: true },
    )
    handleBlockTypeChange(editor)(createSelectEvent('paragraph'))
    await flushLexicalCommit()
    editor.getEditorState().read(() => {
      const first = $getRoot().getFirstChildOrThrow()
      expect($isParagraphNode(first)).toBe(true)
    })
  })

  it('should set blocks to a heading when the select value is a heading tag', async () => {
    const editor = createTestEditor()
    editor.update(
      () => {
        const root = $getRoot()
        root.clear()
        const paragraph = $createParagraphNode()
        const text = $createTextNode('Hello')
        paragraph.append(text)
        root.append(paragraph)
        text.select(0, 5)
      },
      { discrete: true },
    )
    handleBlockTypeChange(editor)(createSelectEvent('h3'))
    await flushLexicalCommit()
    editor.getEditorState().read(() => {
      const first = $getRoot().getFirstChildOrThrow()
      expect($isHeadingNode(first)).toBe(true)
      expect((first as HeadingNode).getTag()).toBe('h3')
    })
  })

  it('should change one heading level to another', async () => {
    const editor = createTestEditor()
    editor.update(
      () => {
        const root = $getRoot()
        root.clear()
        const heading = $createHeadingNode('h2')
        const text = $createTextNode('Title')
        heading.append(text)
        root.append(heading)
        text.select(0, 5)
      },
      { discrete: true },
    )
    handleBlockTypeChange(editor)(createSelectEvent('h6'))
    await flushLexicalCommit()
    editor.getEditorState().read(() => {
      const first = $getRoot().getFirstChildOrThrow()
      expect($isHeadingNode(first)).toBe(true)
      expect((first as HeadingNode).getTag()).toBe('h6')
    })
  })
})

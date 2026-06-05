import { $createHeadingNode, HeadingNode } from '@lexical/rich-text'
import {
  $createParagraphNode,
  $createRangeSelection,
  $createTextNode,
  $getRoot,
  $getSelection,
  $setSelection,
  createEditor,
  ParagraphNode,
  RangeSelection,
  TextNode,
} from 'lexical'

import { updateToolbar } from '../updateToolbar'

function createTestEditor() {
  return createEditor({
    namespace: 'update-toolbar-test',
    nodes: [HeadingNode, ParagraphNode, TextNode],
    onError: () => {},
  })
}

const PARAMS = {
  setBlockType: vi.fn(),
  setIsBold: vi.fn(),
  setIsItalic: vi.fn(),
  setIsStrikethrough: vi.fn(),
  setIsUnderline: vi.fn(),
} satisfies FirstParameterOf<typeof updateToolbar>
const {
  setBlockType,
  setIsBold,
  setIsItalic,
  setIsStrikethrough,
  setIsUnderline,
} = PARAMS

afterEach(() => {
  vi.clearAllMocks()
})

describe('updateToolbar', () => {
  it('should not call state params when there is no range selection', () => {
    const editor = createTestEditor()
    editor.update(() => {
      const root = $getRoot()
      root.clear()
      const paragraph = $createParagraphNode()
      const text = $createTextNode('Hello')
      paragraph.append(text)
      root.append(paragraph)
      $setSelection(null)
      updateToolbar(PARAMS)
    })
    expect([
      setBlockType.mock.calls.length,
      setIsBold.mock.calls.length,
      setIsItalic.mock.calls.length,
      setIsUnderline.mock.calls.length,
      setIsStrikethrough.mock.calls.length,
    ]).toEqual([0, 0, 0, 0, 0])
  })

  it('should handle range selection with anchor on the root', () => {
    const editor = createTestEditor()
    editor.update(() => {
      const root = $getRoot()
      root.clear()
      const paragraph = $createParagraphNode()
      const text = $createTextNode('Hello')
      paragraph.append(text)
      root.append(paragraph)
      $setSelection($createRangeSelection())
      updateToolbar(PARAMS)
    })
    expect({
      blockType: setBlockType.mock.calls,
      bold: setIsBold.mock.calls,
      italic: setIsItalic.mock.calls,
      strikethrough: setIsStrikethrough.mock.calls,
      underline: setIsUnderline.mock.calls,
    }).toEqual({
      blockType: [['paragraph']],
      bold: [[false]],
      italic: [[false]],
      strikethrough: [[false]],
      underline: [[false]],
    })
  })

  it('should set block type to paragraph when the selection is in a paragraph', () => {
    const editor = createTestEditor()
    editor.update(() => {
      const root = $getRoot()
      root.clear()
      const paragraph = $createParagraphNode()
      const text = $createTextNode('Hello')
      paragraph.append(text)
      root.append(paragraph)
      text.select(0, 5)
      updateToolbar(PARAMS)
    })
    expect(setBlockType).toHaveBeenCalledWith('paragraph')
  })

  it('should set block type to the heading tag when the selection is in a non-h1 heading', () => {
    const editor = createTestEditor()
    editor.update(() => {
      const root = $getRoot()
      root.clear()
      const heading = $createHeadingNode('h2')
      const text = $createTextNode('Title')
      heading.append(text)
      root.append(heading)
      text.select(0, 5)
      updateToolbar(PARAMS)
    })
    expect(setBlockType).toHaveBeenCalledWith('h2')
  })

  it('should not call setBlockType when the selection is in an h1 heading', () => {
    const editor = createTestEditor()
    editor.update(() => {
      const root = $getRoot()
      root.clear()
      const heading = $createHeadingNode('h1')
      const text = $createTextNode('Title')
      heading.append(text)
      root.append(heading)
      text.select(0, 5)
      updateToolbar(PARAMS)
    })
    expect(setBlockType).not.toHaveBeenCalled()
  })

  it('should set bold and italic state from the current selection formats', () => {
    const editor = createTestEditor()
    editor.update(() => {
      const root = $getRoot()
      root.clear()
      const paragraph = $createParagraphNode()
      const text = $createTextNode('Hello')
      paragraph.append(text)
      root.append(paragraph)
      text.select(0, 5)
      const selection = $getSelection() as RangeSelection
      selection.toggleFormat('bold')
      selection.toggleFormat('italic')
      updateToolbar(PARAMS)
    })
    expect({
      bold: setIsBold.mock.calls,
      italic: setIsItalic.mock.calls,
    }).toEqual({ bold: [[true]], italic: [[true]] })
  })

  it('should set strikethrough and underline state from the current selection formats', () => {
    const editor = createTestEditor()
    editor.update(() => {
      const root = $getRoot()
      root.clear()
      const paragraph = $createParagraphNode()
      const text = $createTextNode('Hello')
      paragraph.append(text)
      root.append(paragraph)
      text.select(0, 5)
      const selection = $getSelection() as RangeSelection
      selection.toggleFormat('strikethrough')
      selection.toggleFormat('underline')
      updateToolbar(PARAMS)
    })
    expect({
      strikethrough: setIsStrikethrough.mock.calls,
      underline: setIsUnderline.mock.calls,
    }).toEqual({ strikethrough: [[true]], underline: [[true]] })
  })
})

import { useEffect } from 'react'
import {
  InitialConfigType,
  LexicalComposer,
} from '@lexical/react/LexicalComposer'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { render, waitFor } from '@testing-library/react'
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  ParagraphNode,
  TextNode,
} from 'lexical'

import { OnChangePlugin } from '../onChangePlugin'

const INITIAL_CONFIG: InitialConfigType = {
  namespace: 'on-change-plugin-test',
  nodes: [ParagraphNode, TextNode],
  onError: () => {},
}

function AppendParagraphPlugin({ text }: { text: string }) {
  const [editor] = useLexicalComposerContext()
  useEffect(() => {
    editor.update(() => {
      const root = $getRoot()
      const paragraph = $createParagraphNode()
      paragraph.append($createTextNode(text))
      root.append(paragraph)
    })
  }, [editor, text])
  return null
}

const PROPS: PropsOf<typeof OnChangePlugin> = {
  onChange: vi.fn(),
}

describe('<OnChangePlugin />', () => {
  it('should call onChange with editor state that reflects content updates', async () => {
    const onChange = vi.mocked(PROPS.onChange)
    render(
      <LexicalComposer initialConfig={INITIAL_CONFIG}>
        <OnChangePlugin {...PROPS} />
        <AppendParagraphPlugin text="hello" />
      </LexicalComposer>,
    )
    await waitFor(() => expect(onChange).toHaveBeenCalled())
    const editorState = onChange.mock.calls[onChange.mock.calls.length - 1][0]
    expect(
      editorState.read(() => $getRoot().getTextContent().trim()),
    ).toBe('hello')
  })
})

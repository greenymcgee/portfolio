import { faker } from '@faker-js/faker'
import { InitialConfigType } from '@lexical/react/LexicalComposer'
import { HeadingNode } from '@lexical/rich-text'
import { ParagraphNode, TextNode } from 'lexical'

export const LEXICAL_EDITOR_JSON = JSON.stringify({
  root: {
    children: [],
    direction: null,
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
})

export const FIRST_PARAGRAPH_TEXT = faker.lorem.paragraph()

export const SECOND_PARAGRAPH_TEXT = faker.lorem.paragraph()

export const TEST_LEXICAL_CONFIG: InitialConfigType = {
  editable: true,
  namespace: 'toolbar-plugin-test',
  nodes: [HeadingNode, ParagraphNode, TextNode],
  onError: vi.fn(),
}

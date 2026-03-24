import { faker } from '@faker-js/faker'
import { InitialConfigType } from '@lexical/react/LexicalComposer'
import { HeadingNode } from '@lexical/rich-text'
import { ParagraphNode, TextNode } from 'lexical'

export const LEXICAL_EDITOR_JSON = JSON.stringify({
  root: {
    children: [
      {
        children: [
          {
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: faker.lorem.paragraph(),
            type: 'text',
            version: 1,
          },
        ],
        direction: null,
        format: '',
        indent: 0,
        textFormat: 0,
        textStyle: '',
        type: 'paragraph',
        version: 1,
      },
    ],
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

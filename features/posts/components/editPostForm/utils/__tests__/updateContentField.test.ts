import { EditorState } from 'lexical'

import { LEXICAL_EDITOR_JSON } from '@/test/fixtures'

import { updateContentField } from '..'

const json = JSON.parse(LEXICAL_EDITOR_JSON)
const editorState = { toJSON: () => json } as unknown as EditorState

describe('updateContentField()', () => {
  it('should do nothing when contentRef is not mounted', () => {
    const contentRef = { current: null }
    const fieldChangeCallback = vi.fn()
    updateContentField({ contentRef, editorState, fieldChangeCallback })
    expect(fieldChangeCallback).not.toHaveBeenCalled()
  })

  it('should set the content input value and call fieldChangeCallback', () => {
    const input = document.createElement('input')
    const contentRef = { current: input }
    const fieldChangeCallback = vi.fn()
    updateContentField({ contentRef, editorState, fieldChangeCallback })
    expect(input.value).toBe(JSON.stringify(json))
    expect(fieldChangeCallback).toHaveBeenCalledTimes(1)
  })
})

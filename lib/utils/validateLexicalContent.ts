import { type InputJsonValue } from '@prisma/client/runtime/client'

import type { Prisma } from '@/prisma/generated/client'

import { createHeadlessBlogEditor } from '../lexical'

/**
 * Ensures the content passes a parseEditorState check. Only checks string
 * content that has length.
 */
export function validateLexicalContent(
  content: Prisma.NullableJsonNullValueInput | InputJsonValue | undefined,
) {
  const editor = createHeadlessBlogEditor()
  try {
    if (typeof content !== 'string' || !content.length) return { error: null }

    editor.parseEditorState(content)
    return { error: null }
  } catch (error) {
    return { error }
  }
}

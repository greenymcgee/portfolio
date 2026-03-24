import { HeadingNode } from '@lexical/rich-text'
import { ParagraphNode, TextNode } from 'lexical'

export const BLOG_EDITOR_CONFIG = {
  namespace: 'blog',
  nodes: [HeadingNode, ParagraphNode, TextNode],
  /* v8 ignore start */
  onError(error: unknown) {
    throw error
  },
  /* v8 ignore stop */
}

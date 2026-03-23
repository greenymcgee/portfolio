import { HeadingNode } from '@lexical/rich-text'

export const BLOG_EDITOR_CONFIG = {
  namespace: 'blog',
  nodes: [HeadingNode],
  /* v8 ignore start */
  onError(error: unknown) {
    throw error
  },
  /* v8 ignore stop */
}

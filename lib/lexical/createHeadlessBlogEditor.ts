import { createHeadlessEditor } from '@lexical/headless'

import { BLOG_EDITOR_CONFIG } from './constants'

export function createHeadlessBlogEditor() {
  return createHeadlessEditor(BLOG_EDITOR_CONFIG)
}

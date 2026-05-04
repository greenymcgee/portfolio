import { HeadingTagType } from '@lexical/rich-text'

export type BlockType = 'paragraph' | Exclude<HeadingTagType, 'h1'>

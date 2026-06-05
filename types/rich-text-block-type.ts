import { HeadingTagType } from '@lexical/rich-text'

export type RichTextBlockType = 'paragraph' | Exclude<HeadingTagType, 'h1'>

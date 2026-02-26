import type { SummonError, SummonResponse } from '@greenymcgee/summon'
import { ActionState } from '@greenymcgee/typescript-utils'
import { ZodError } from 'zod'

import { Post } from '@/prisma/generated/client'

export interface PostCreateState extends ActionState {
  content?: FormDataEntryValue | null
  error?: ZodError
  response?: { message: string; post: Post }
  publishedAt?: FormDataEntryValue | null
  title?: FormDataEntryValue | null
}

export interface PostCreateResponseData {
  message: string
  post: Post
}

export interface PostCreateErrorData {
  message: string
}

export type PostCreateResponse = SummonResponse<PostCreateResponseData>

export type PostCreateError = SummonError<PostCreateErrorData>

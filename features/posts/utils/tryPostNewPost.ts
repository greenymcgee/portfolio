import { tryCatch } from '@greenymcgee/typescript-utils'

import { postPostCreateRequest } from '../requests'
import type { CreatePostParams } from '../schemas'
import { PostCreateError, PostCreateResponse } from '../types'

export function tryPostNewPost(params: CreatePostParams, cookie: string) {
  return tryCatch<PostCreateResponse, PostCreateError>(
    postPostCreateRequest(params, cookie),
  )
}

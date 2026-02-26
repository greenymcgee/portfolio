import { tryCatch } from '@greenymcgee/typescript-utils'

import { postPostCreateRequest } from '../requests'
import type { PostCreateParams } from '../schemas'
import { PostCreateError, PostCreateResponse } from '../types'

export function tryPostNewPost(params: PostCreateParams, cookie: string) {
  return tryCatch<PostCreateResponse, PostCreateError>(
    postPostCreateRequest(params, cookie),
  )
}

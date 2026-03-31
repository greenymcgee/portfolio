import { API_ROUTES } from '@/globals/constants'
import { baseAPI } from '@/lib/baseAPI'

import type { CreatePostParams } from '../schemas'
import type { PostCreateError, PostCreateResponseData } from '../types'

export function postPostCreateRequest(
  params: CreatePostParams,
  cookie: string,
) {
  return baseAPI.post<
    PostCreateResponseData,
    CreatePostParams,
    PostCreateError
  >(API_ROUTES.posts, {
    body: params,
    headers: { Cookie: cookie },
  })
}

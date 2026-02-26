import { API_ROUTES } from '@/constants'
import { baseAPI } from '@/lib/baseAPI'

import type { PostCreateParams } from '../schemas'
import type { PostCreateError, PostCreateResponseData } from '../types'

export function postPostCreateRequest(
  params: PostCreateParams,
  cookie: string,
) {
  return baseAPI.post<
    PostCreateResponseData,
    PostCreateParams,
    PostCreateError
  >(API_ROUTES.posts, {
    body: params,
    headers: { Cookie: cookie },
  })
}

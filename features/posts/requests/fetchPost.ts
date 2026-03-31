import { headers as getHeaders } from 'next/headers'

import { API_ROUTES } from '@/globals/constants'
import { baseAPI } from '@/lib/baseAPI'

import { AuthoredPost } from '../types'

type GetPostResponse = { post: AuthoredPost }

export async function fetchPost(id: AuthoredPost['id']) {
  const headers = await getHeaders()
  const cookie = headers.get('cookie') ?? ''
  return baseAPI.get<GetPostResponse>(API_ROUTES.post(id), {
    headers: { Cookie: cookie },
  })
}

'use server'

import { FindAndCountPostsDto } from '../dto'
import { authorizeUnpublishedPosts } from './authorizeUnpublishedPosts'
import { getPostsCache } from './getPostsCache'

/**
 * Strictly enforces authorization for unpublished posts with redirects, and
 * then gets the posts cache. If unpublished is false or undefined then the auth
 * check is bypassed.
 */
export async function getPosts(
  params: FirstConstructorParameterOf<typeof FindAndCountPostsDto>,
) {
  const { error: authZodError } = await authorizeUnpublishedPosts(params)
  if (authZodError) {
    return {
      currentPage: null,
      error: authZodError,
      posts: null,
      totalPages: null,
    }
  }

  return getPostsCache(params)
}

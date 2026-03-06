import { errAsync, okAsync } from 'neverthrow'

import { BAD_REQUEST, SUCCESS } from '@/constants'
import { PrismaError } from '@/lib/errors'
import { logger } from '@/lib/logger'

import { getPostsSchema } from '../schemas'
import { tryCollectPosts, tryCountPosts } from '../utils'

/**
 * Handles querying the posts table to collect posts.
 *
 * @example
 * const searchParams = new URLSearchParams()
 * searchParams.set('limit', '50')
 * searchParams.set('page', '1')
 * const request = new Request(`http://localhost:3000/api/posts?${searchParams}`)
 * const service = new GetPostsService(request)
 * return service.getPosts()
 */
export class GetPostsService {
  public limit = 10

  public page = 0

  private url: URL

  constructor(request: Request) {
    this.url = new URL(request.url)
  }

  public async getPosts() {
    const paramsError = this.validateParams()
    if (paramsError) {
      return errAsync({
        details: paramsError,
        status: BAD_REQUEST,
        type: 'zod' as const,
      } as const)
    }

    const posts = await tryCollectPosts({
      limit: this.limit,
      offset: this.offset,
    })
    if (posts instanceof PrismaError) {
      return errAsync({
        details: posts.details,
        status: posts.status,
        type: 'query' as const,
      } as const)
    }

    const count = await tryCountPosts()
    if (count instanceof PrismaError) {
      return errAsync({
        details: count.details,
        status: count.status,
        type: 'count' as const,
      } as const)
    }

    return okAsync({
      posts,
      status: SUCCESS,
      totalPages: Math.ceil(count / this.limit),
    } as const)
  }

  private get offset() {
    if (this.page) return this.page * this.limit

    return this.page
  }

  private get params() {
    const { searchParams } = this.url
    return { limit: searchParams.get('limit'), page: searchParams.get('page') }
  }

  private validateParams() {
    const { data, error } = getPostsSchema.safeParse(this.params)
    if (error) {
      logger.error({ error }, 'GET_POSTS_INVALID_REQUEST_PARAMS')
      return error
    }

    this.limit = data.limit
    this.page = data.page
  }
}

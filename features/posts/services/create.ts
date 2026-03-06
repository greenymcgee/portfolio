import { tryCatch } from '@greenymcgee/typescript-utils'
import { errAsync, okAsync } from 'neverthrow'
import { Session } from 'next-auth'
import { ZodError } from 'zod'

import {
  CREATED,
  FORBIDDEN,
  UNAUTHORIZED,
  UNPROCESSABLE_CONTENT,
} from '@/constants'
import { authenticateAPISession } from '@/lib/auth'
import { PrismaError, RequestJSONError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { hasPermission } from '@/lib/permissions'

import { postCreateSchema } from '../schemas'
import { tryInsertPost } from '../utils'

/**
 * Authorizes and authenticates the User, validates the params, and creates the
 * Post.
 *
 * @param {Request} request
 */
export class CreatePostService {
  private request: Request

  constructor(request: Request) {
    this.request = request
  }

  public async createPost() {
    const user = await authenticateAPISession()
    if (user === null)
      return errAsync({
        status: UNAUTHORIZED,
        type: 'unauthorized' as const,
      } as const)

    const authorizedUser = this.authorizeUser(user)
    if (authorizedUser === null)
      return errAsync({
        status: FORBIDDEN,
        type: 'forbidden' as const,
      } as const)

    const params = await this.validateParams()
    if (params instanceof RequestJSONError) {
      return errAsync({
        details: params.details,
        status: params.status,
        type: 'json' as const,
      } as const)
    }

    if (params instanceof ZodError) {
      return errAsync({
        details: params,
        status: UNPROCESSABLE_CONTENT,
        type: 'zod' as const,
      } as const)
    }

    const post = await tryInsertPost(params, user)
    if (post instanceof PrismaError) {
      return errAsync({
        details: post.details,
        status: post.status,
        type: 'insert',
      } as const)
    }

    return okAsync({ post, status: CREATED } as const)
  }

  private authorizeUser(user: Session['user']) {
    if (hasPermission(user, 'posts', 'create')) return user

    logger.error({ userId: user.id }, 'POST_CREATE_PERMISSION_ERROR')
    return null
  }

  private async getZodValidationResult() {
    const { error, response } = await tryCatch(this.request.json())
    if (error) return { error: new RequestJSONError(error) }

    return { result: postCreateSchema.safeParse(response) }
  }

  private async validateParams() {
    const { error, result } = await this.getZodValidationResult()
    if (error) {
      logger.error({ error }, 'POST_CREATE_REQUEST_JSON_ERROR')
      return error
    }

    if (result.error) {
      logger.error({ error: result.error }, 'POST_CREATE_VALIDATION_ERROR')
      return result.error
    }

    return result.data
  }
}

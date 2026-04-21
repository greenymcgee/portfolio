import { errAsync } from 'neverthrow'
import { ZodError } from 'zod'

import { PostService } from '@/features/posts/post.service'
import { BAD_REQUEST } from '@/globals/constants'
import { prisma } from '@/lib/prisma'
import { setupTestDatabase } from '@/test/helpers/utils'

import { getPost } from '..'

type FindOneReturn = Awaited<ReturnType<typeof PostService.findOne>>

let findOneSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  findOneSpy = vi.spyOn(PostService, 'findOne')
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('getPost', () => {
  it('should return an error for an invalid id', async () => {
    const result = await getPost(NaN)
    expect(result).toEqual({
      error: expect.objectContaining({ details: expect.any(ZodError) }),
      post: null,
    })
  })

  it('should return an error for an entity error', async () => {
    const error = { details: {}, status: BAD_REQUEST, type: 'entity' }
    findOneSpy.mockResolvedValueOnce(
      errAsync(error) as unknown as FindOneReturn,
    )
    const result = await getPost(1)
    expect(result).toEqual({ error, post: null })
  })

  it('should return an error for any unexpected errors', async () => {
    const error = { details: {}, status: 418 }
    findOneSpy.mockResolvedValueOnce(
      errAsync(error) as unknown as FindOneReturn,
    )
    const result = await getPost(1)
    expect(result).toEqual({ error, post: null })
  })

  describe('integration', () => {
    setupTestDatabase({ withPosts: true, withUsers: true })

    it('should return the post upon success', async () => {
      const post = await prisma.post.findFirst()
      const author = await prisma.user.findFirst({
        where: { id: post?.authorId },
      })
      const result = await getPost(post?.id as number)
      expect(result).toEqual({
        error: null,
        post: {
          author: { firstName: author?.firstName, lastName: author?.lastName },
          authorId: post?.authorId,
          content: post?.content,
          createdAt: post?.createdAt,
          description: post?.description,
          id: post?.id,
          publishedAt: post?.publishedAt,
          title: post?.title,
          updatedAt: post?.updatedAt,
        },
      })
    })
  })
})

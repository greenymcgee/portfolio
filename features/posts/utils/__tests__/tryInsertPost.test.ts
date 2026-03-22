import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'

import { PrismaError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import { postFactory, userFactory } from '@/test/factories'
import { LEXICAL_EDITOR_JSON } from '@/test/fixtures'
import { createJWTMock } from '@/test/helpers/utils'

import { tryInsertPost } from '..'

vi.mock('@/lib/prisma', () => ({ prisma: { post: { create: vi.fn() } } }))

describe('tryInsertPost', () => {
  it('should return an error when post content is missing', async () => {
    const user = userFactory.build()
    const token = createJWTMock(user)
    const params = {
      content: null,
      publishedAt: null,
      title: 'Title',
    }
    const result = await tryInsertPost(params, token)
    expect(result).toEqual(new Error('Post content required'))
    expect(prisma.post.create).not.toHaveBeenCalled()
  })

  it('should return an error when post content is not valid Lexical state', async () => {
    const user = userFactory.build()
    const token = createJWTMock(user)
    const params = {
      content: 'not-json',
      publishedAt: new Date(),
      title: 'Title',
    }
    const result = await tryInsertPost(params, token)
    expect(result).toEqual(new Error('Post content validation failed'))
    expect(prisma.post.create).not.toHaveBeenCalled()
  })

  it('should accept valid Lexical content', async () => {
    const user = userFactory.build()
    const token = createJWTMock(user)
    const params = {
      content: LEXICAL_EDITOR_JSON,
      publishedAt: new Date(),
      title: 'Title',
    }
    await tryInsertPost(params, token)
    expect(prisma.post.create).toHaveBeenCalledWith({
      data: {
        authorId: token.id,
        content: LEXICAL_EDITOR_JSON,
        publishedAt: params.publishedAt,
        title: params.title,
      },
    })
  })

  it('should return an error', async () => {
    const error = new PrismaClientKnownRequestError('Bad', {
      clientVersion: '',
      code: 'P1005',
    })
    vi.mocked(prisma.post.create).mockRejectedValue(error)
    const user = userFactory.build()
    const token = createJWTMock(user)
    const params = {
      content: LEXICAL_EDITOR_JSON,
      publishedAt: new Date(),
      title: 'Title',
    }
    const result = await tryInsertPost(params, token)
    expect(result).toEqual(new PrismaError(error))
  })

  it('should return a response', async () => {
    const prismaResponse = postFactory.build()
    vi.mocked(prisma.post.create).mockResolvedValue(prismaResponse)
    const user = userFactory.build()
    const token = createJWTMock(user)
    const params = {
      content: LEXICAL_EDITOR_JSON,
      publishedAt: new Date(),
      title: 'Title',
    }
    const response = await tryInsertPost(params, token)
    expect(response).toBe(prismaResponse)
  })
})

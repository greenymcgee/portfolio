import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client'

import { prisma } from '@/lib/prisma'
import { postFactory, userFactory } from '@/test/factories'
import { createJWTMock } from '@/test/helpers/utils'

import { tryInsertPost } from '..'

vi.mock('@/lib/prisma', () => ({ prisma: { post: { create: vi.fn() } } }))

describe('tryInsertPost', () => {
  it('should default to undefined content when params.content is null', async () => {
    const user = userFactory.build()
    const token = createJWTMock(user)
    const params = {
      content: null,
      publishedAt: null,
      title: 'Title',
    }
    await tryInsertPost(params, token)
    expect(prisma.post.create).toHaveBeenCalledWith({
      data: {
        authorId: token.id,
        content: undefined,
        publishedAt: params.publishedAt,
        title: params.title,
      },
    })
  })

  it('should accept content', async () => {
    const user = userFactory.build()
    const token = createJWTMock(user)
    const params = {
      content: { h1: 'Hello' },
      publishedAt: new Date(),
      title: 'Title',
    }
    await tryInsertPost(params, token)
    expect(prisma.post.create).toHaveBeenCalledWith({
      data: {
        authorId: token.id,
        content: params.content,
        publishedAt: params.publishedAt,
        title: params.title,
      },
    })
  })

  it('should return an error', async () => {
    const prismaError = new PrismaClientKnownRequestError('Bad', {
      clientVersion: '',
      code: 'P1005',
    })
    vi.mocked(prisma.post.create).mockRejectedValue(prismaError)
    const user = userFactory.build()
    const token = createJWTMock(user)
    const params = {
      content: { h1: 'Hello' },
      publishedAt: new Date(),
      title: 'Title',
    }
    const { error } = await tryInsertPost(params, token)
    expect(error).toBe(prismaError)
  })

  it('should return a response', async () => {
    const prismaResponse = postFactory.build()
    vi.mocked(prisma.post.create).mockResolvedValue(prismaResponse)
    const user = userFactory.build()
    const token = createJWTMock(user)
    const params = {
      content: { h1: 'Hello' },
      publishedAt: new Date(),
      title: 'Title',
    }
    const { response } = await tryInsertPost(params, token)
    expect(response).toBe(prismaResponse)
  })
})

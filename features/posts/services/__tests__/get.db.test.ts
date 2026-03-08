/* eslint-disable neverthrow/must-use-result */
import { Err, Ok } from 'neverthrow'
import { NextRequest } from 'next/server'

import { INTERNAL_SERVER_ERROR, SUCCESS } from '@/globals/constants'
import { PrismaError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import { setupTestDatabase } from '@/test/helpers/utils'

import * as postUtils from '../../utils'
import { GetPostsService } from '../get'

const url = 'http://nothing.greeny'

setupTestDatabase({ withPosts: true, withUsers: true })

describe('GetPostsService', () => {
  describe('error', () => {
    it('should return details and a status when the collection throws an error', async () => {
      const error = new Error('Server Error')
      const tryCollectPostsSpy = vi
        .spyOn(postUtils, 'tryCollectPosts')
        .mockResolvedValueOnce(new PrismaError(error))
      const service = new GetPostsService(new NextRequest(url))
      const result = await service.getPosts()
      expect(result).toEqual(
        new Err({
          details: error,
          status: INTERNAL_SERVER_ERROR,
          type: 'query',
        }),
      )
      tryCollectPostsSpy.mockRestore()
    })

    it('should return details and a status when the count throws an error', async () => {
      const error = new Error('Server Error')
      const tryCountPostsSpy = vi
        .spyOn(postUtils, 'tryCountPosts')
        .mockResolvedValueOnce(new PrismaError(error))
      const service = new GetPostsService(new NextRequest(url))
      const result = await service.getPosts()
      expect(result).toEqual(
        new Err({
          details: error,
          status: INTERNAL_SERVER_ERROR,
          type: 'count',
        }),
      )
      tryCountPostsSpy.mockRestore()
    })
  })

  describe('ok', () => {
    it('should return an ok response with posts upon success', async () => {
      const service = new GetPostsService(new NextRequest(url))
      const result = await service.getPosts()
      const expectedPosts = await prisma.post.findMany({
        include: { author: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
        skip: service.page,
        take: service.limit,
      })
      expect(result).toEqual(
        new Ok({
          posts: expectedPosts,
          status: SUCCESS,
          totalPages: Math.ceil((await prisma.post.count()) / service.limit),
        }),
      )
    })

    it('should accept 2 params', async () => {
      const searchParams = new URLSearchParams()
      const page = 1
      const limit = 5
      searchParams.set('page', String(page))
      searchParams.set('limit', String(limit))
      const service = new GetPostsService(
        new NextRequest(`${url}?${searchParams}`),
      )
      const result = await service.getPosts()
      const expectedPosts = await prisma.post.findMany({
        include: { author: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: 'desc' },
        skip: limit * page,
        take: limit,
      })
      expect(result).toEqual(
        new Ok({
          posts: expectedPosts,
          status: SUCCESS,
          totalPages: Math.ceil((await prisma.post.count()) / limit),
        }),
      )
    })
  })
})

/* eslint-enable neverthrow/must-use-result */

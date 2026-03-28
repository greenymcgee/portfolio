/* eslint-disable neverthrow/must-use-result */
import { Err, Ok } from 'neverthrow'
import { ZodError } from 'zod'

import {
  BAD_REQUEST,
  HTTP_TEXT_BY_STATUS,
  NOT_FOUND,
  SUCCESS,
} from '@/globals/constants'
import { PrismaError } from '@/lib/errors'
import { POSTS, PUBLISHED_POST } from '@/test/fixtures'

import { FindAndCountPostsDto, FindPostDto } from '../dto'
import { PostRepository } from '../post.repository'
import { PostService } from '../post.service'

vi.mock('../post.repository', () => ({
  PostRepository: { findAndCount: vi.fn(), findOne: vi.fn() },
}))

describe('PostService', () => {
  describe('findAndCount', () => {
    it('should return a PrismaError', async () => {
      const error = new PrismaError(new Error('bad'))
      vi.mocked(PostRepository.findAndCount).mockResolvedValueOnce(error)
      const result = await PostService.findAndCount(
        new FindAndCountPostsDto(new Request('http://green.no/posts')),
      )
      expect(result).toEqual(
        new Err({
          details: error.details,
          status: error.status,
          type: 'entity',
        }),
      )
    })

    it('should return a ZodError', async () => {
      const error = new ZodError([])
      vi.mocked(PostRepository.findAndCount).mockResolvedValue(error)
      const result = await PostService.findAndCount(
        new FindAndCountPostsDto(
          new Request('http://greeny.no/posts?limit="invalid'),
        ),
      )
      expect(result).toEqual(
        new Err({ details: error, status: BAD_REQUEST, type: 'dto' }),
      )
    })

    it('should return posts', async () => {
      vi.mocked(PostRepository.findAndCount).mockResolvedValue({
        // @ts-expect-error: the author isn't important for this test
        posts: POSTS,
        totalPages: 22,
      })
      const result = await PostService.findAndCount(
        new FindAndCountPostsDto(new Request('http://greeny.no/posts')),
      )
      expect(result).toEqual(
        new Ok({ posts: POSTS, status: SUCCESS, totalPages: 22 }),
      )
    })
  })

  describe('findOne', () => {
    it('should return a PrismaError', async () => {
      const error = new PrismaError(new Error('bad'))
      vi.mocked(PostRepository.findOne).mockResolvedValueOnce(error)
      const result = await PostService.findOne(
        new FindPostDto({ params: Promise.resolve({ id: '1' }) }),
      )
      expect(result).toEqual(
        new Err({
          details: error.details,
          status: error.status,
          type: 'entity',
        }),
      )
    })

    it('should return a ZodError', async () => {
      const error = new ZodError([])
      vi.mocked(PostRepository.findOne).mockResolvedValue(
        error as ZodError<number>,
      )
      const result = await PostService.findOne(
        new FindPostDto({ params: Promise.resolve({ id: '1' }) }),
      )
      expect(result).toEqual(
        new Err({ details: error, status: BAD_REQUEST, type: 'dto' }),
      )
    })

    it('should return a not found error', async () => {
      const error = new Error(HTTP_TEXT_BY_STATUS[NOT_FOUND], {
        cause: { status: NOT_FOUND },
      })
      vi.mocked(PostRepository.findOne).mockResolvedValue(error)
      const result = await PostService.findOne(
        new FindPostDto({ params: Promise.resolve({ id: '1' }) }),
      )
      expect(result).toEqual(
        new Err({ details: error, status: NOT_FOUND, type: 'entity' }),
      )
    })

    it('should return a post', async () => {
      // @ts-expect-error: the author isn't important for this test
      vi.mocked(PostRepository.findOne).mockResolvedValue(PUBLISHED_POST)
      const result = await PostService.findOne(
        new FindPostDto({ params: Promise.resolve({ id: '1' }) }),
      )
      expect(result).toEqual(new Ok({ post: PUBLISHED_POST, status: SUCCESS }))
    })
  })
})

/* eslint-enable neverthrow/must-use-result */

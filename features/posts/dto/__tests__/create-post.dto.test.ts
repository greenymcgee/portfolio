import { faker } from '@faker-js/faker'
import { ZodError } from 'zod'

import { RequestJSONError } from '@/lib/errors'
import { LEXICAL_EDITOR_JSON } from '@/test/fixtures'
import { getApiUrl } from '@/test/helpers/utils'

import { CreatePostDto } from '../create-post.dto'

describe('CreatePostDto', () => {
  describe('getParams', () => {
    it('should return RequestJSONError', async () => {
      const url = getApiUrl('posts')
      const body = '{'
      const request = new Request(url, { body, method: 'POST' })
      const dto = new CreatePostDto(request)
      const result = await dto.getParams()
      expect(result).toEqual(expect.any(RequestJSONError))
    })

    it('should return ZodError', async () => {
      const url = getApiUrl('posts')
      const body = '{}'
      const request = new Request(url, { body, method: 'POST' })
      const dto = new CreatePostDto(request)
      const result = await dto.getParams()
      expect(result).toEqual(expect.any(ZodError))
    })

    it('should return parsed data', async () => {
      const url = getApiUrl('posts')
      const publishedAt = new Date()
      const body = {
        content: LEXICAL_EDITOR_JSON,
        description: faker.lorem.word(),
        publishedAt: publishedAt.toISOString(),
        title: faker.book.title(),
      }
      const request = new Request(url, {
        body: JSON.stringify(body),
        method: 'POST',
      })
      const dto = new CreatePostDto(request)
      const result = await dto.getParams()
      expect(result).toEqual({ ...body, publishedAt })
    })

    it('should allow an optional description and publishedAt for work in progress', async () => {
      const url = getApiUrl('posts')
      const body = {
        content: LEXICAL_EDITOR_JSON,
        description: null,
        publishedAt: null,
        title: faker.book.title(),
      }
      const request = new Request(url, {
        body: JSON.stringify(body),
        method: 'POST',
      })
      const dto = new CreatePostDto(request)
      const result = await dto.getParams()
      expect(result).toEqual({ ...body, description: '' })
    })
  })
})

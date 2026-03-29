import { faker } from '@faker-js/faker'
import { ZodError } from 'zod'

import { RequestJSONError } from '@/lib/errors'

import { CreatePostDto } from '../create-post.dto'

describe('CreatePostDto', () => {
  describe('getParams', () => {
    it('should return RequestJSONError', async () => {
      const url = 'http://greeny.nothing/posts'
      const body = '{'
      const request = new Request(url, { body, method: 'POST' })
      const dto = new CreatePostDto(request)
      const result = await dto.getParams()
      expect(result).toEqual(expect.any(RequestJSONError))
    })

    it('should return ZodError', async () => {
      const url = 'http://greeny.nothing/posts'
      const body = '{}'
      const request = new Request(url, { body, method: 'POST' })
      const dto = new CreatePostDto(request)
      const result = await dto.getParams()
      expect(result).toEqual(expect.any(ZodError))
    })

    it('should return parsed data', async () => {
      const url = 'http://greeny.nothing/posts'
      const body = {
        content: '<p>hello</p>',
        publishedAt: null,
        title: faker.book.title(),
      }
      const request = new Request(url, {
        body: JSON.stringify(body),
        method: 'POST',
      })
      const dto = new CreatePostDto(request)
      const result = await dto.getParams()
      expect(result).toEqual(body)
    })
  })
})

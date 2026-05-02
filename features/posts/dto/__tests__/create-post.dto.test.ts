import { faker } from '@faker-js/faker'
import { ZodError } from 'zod'

import { LEXICAL_EDITOR_JSON } from '@/test/fixtures'

import { CreatePostDto } from '../create-post.dto'

describe('CreatePostDto', () => {
  describe('getParams', () => {
    it('should return a ZodError', () => {
      const params = {
        notAllowed: 1,
      } as FirstConstructorParameterOf<typeof CreatePostDto>
      const dto = new CreatePostDto(params)
      expect(dto.params).toEqual(expect.any(ZodError))
    })

    it('should return parsed data', () => {
      const publishedAt = new Date()
      const params = {
        content: LEXICAL_EDITOR_JSON,
        description: faker.lorem.word(),
        publishedAt: publishedAt.toISOString(),
        title: faker.book.title(),
      }
      const dto = new CreatePostDto(params)
      expect(dto.params).toEqual({ ...params, publishedAt })
    })

    it('should allow all params as optional params', () => {
      const params = {}
      const dto = new CreatePostDto(params)
      expect(dto.params).toEqual({
        content: '',
        description: '',
        publishedAt: null,
        title: '',
      })
    })
  })
})

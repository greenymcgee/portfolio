import { faker } from '@faker-js/faker'
import { ZodError } from 'zod'

import { LEXICAL_EDITOR_JSON } from '@/test/fixtures'

import { UpdatePostDto } from '../update-post.dto'

describe('UpdatePostDto', () => {
  describe('params', () => {
    it('should return parsed data', () => {
      const params = {
        content: LEXICAL_EDITOR_JSON,
        description: faker.lorem.word(),
        id: '1',
        title: faker.book.title(),
      }
      const dto = new UpdatePostDto(params)
      expect(dto.params).toEqual({ ...params, id: 1 })
    })

    it('should reject unexpected params', () => {
      const params = {
        content: LEXICAL_EDITOR_JSON,
        description: faker.lorem.word(),
        id: '1',
        notAllowed: 1,
        title: faker.book.title(),
      }
      const dto = new UpdatePostDto(params)
      expect(dto.params).toEqual(expect.any(ZodError))
    })

    it('should require an id', () => {
      const publishedAt = new Date()
      const params = {
        content: LEXICAL_EDITOR_JSON,
        description: faker.lorem.word(),
        publishedAt: publishedAt.toISOString(),
        title: faker.book.title(),
      }
      const dto = new UpdatePostDto(params)
      expect(dto.params).toEqual(expect.any(ZodError))
    })

    it('should require a title', () => {
      const params = {
        content: LEXICAL_EDITOR_JSON,
        description: faker.lorem.word(),
        id: '1',
      }
      const dto = new UpdatePostDto(params)
      expect(dto.params).toEqual(expect.any(ZodError))
    })

    it('should reject a non-numeric id', () => {
      const dto = new UpdatePostDto({
        id: 'not-a-number',
        title: faker.book.title(),
      })
      expect(dto.params).toEqual(expect.any(ZodError))
    })

    it('should reject an empty title', () => {
      const dto = new UpdatePostDto({ id: '1', title: '' })
      expect(dto.params).toEqual(expect.any(ZodError))
    })
  })
})

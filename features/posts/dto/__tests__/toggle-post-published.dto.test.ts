import { faker } from '@faker-js/faker'
import { ZodError } from 'zod'

import { LEXICAL_EDITOR_JSON } from '@/test/fixtures'

import { TogglePostPublishedDto } from '../toggle-post-published.dto'

describe('TogglePostPublishedDto', () => {
  describe('params', () => {
    it('should return parsed data', () => {
      const publishedAt = new Date()
      const params = {
        content: LEXICAL_EDITOR_JSON,
        description: faker.lorem.word(),
        id: '1',
        publishedAt: publishedAt.toISOString(),
        title: faker.book.title(),
      }
      const dto = new TogglePostPublishedDto(params)
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
      const dto = new TogglePostPublishedDto(params)
      expect(dto.params).toEqual(expect.any(ZodError))
    })

    it('should require content', () => {
      const params = {
        description: faker.lorem.word(),
        id: '1',
        title: faker.book.title(),
      }
      const dto = new TogglePostPublishedDto(params)
      expect(dto.params).toEqual(expect.any(ZodError))
    })

    it('should require a description', () => {
      const params = {
        content: LEXICAL_EDITOR_JSON,
        id: '1',
        title: faker.book.title(),
      }
      const dto = new TogglePostPublishedDto(params)
      expect(dto.params).toEqual(expect.any(ZodError))
    })

    it('should require an id', () => {
      const params = {
        content: LEXICAL_EDITOR_JSON,
        description: faker.lorem.word(),
        title: faker.book.title(),
      }
      const dto = new TogglePostPublishedDto(params)
      expect(dto.params).toEqual(expect.any(ZodError))
    })

    it('should require a title', () => {
      const params = {
        content: LEXICAL_EDITOR_JSON,
        description: faker.lorem.word(),
        id: '1',
      }
      const dto = new TogglePostPublishedDto(params)
      expect(dto.params).toEqual(expect.any(ZodError))
    })

    it('should reject empty content', () => {
      const dto = new TogglePostPublishedDto({
        content: '',
        description: faker.lorem.sentence(),
        id: '1',
        title: faker.book.title(),
      })
      expect(dto.params).toEqual(expect.any(ZodError))
    })

    it('should reject an empty description', () => {
      const dto = new TogglePostPublishedDto({
        content: LEXICAL_EDITOR_JSON,
        description: '',
        id: '1',
        title: faker.book.title(),
      })
      expect(dto.params).toEqual(expect.any(ZodError))
    })

    it('should reject a non-numeric id', () => {
      const dto = new TogglePostPublishedDto({
        content: LEXICAL_EDITOR_JSON,
        description: faker.lorem.word(),
        id: 'not-a-number',
        title: faker.book.title(),
      })
      expect(dto.params).toEqual(expect.any(ZodError))
    })

    it('should reject an empty title', () => {
      const dto = new TogglePostPublishedDto({
        content: LEXICAL_EDITOR_JSON,
        description: faker.lorem.word(),
        id: '1',
        title: '',
      })
      expect(dto.params).toEqual(expect.any(ZodError))
    })
  })
})

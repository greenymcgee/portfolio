import { ADMIN_USER, BASIC_USER } from '@/test/fixtures'

import { hasPermission } from '../hasPermission'

describe('user permissions', () => {
  describe('posts', () => {
    it('should not allow create', () => {
      const result = hasPermission(BASIC_USER, 'posts', 'create')
      expect(result).toBe(false)
    })

    it('should not allow delete', () => {
      const result = hasPermission(BASIC_USER, 'posts', 'delete')
      expect(result).toBe(false)
    })

    it('should not allow publish', () => {
      const result = hasPermission(BASIC_USER, 'posts', 'publish')
      expect(result).toBe(false)
    })

    it('should not allow update', () => {
      const result = hasPermission(BASIC_USER, 'posts', 'update')
      expect(result).toBe(false)
    })

    it('should allow view', () => {
      const result = hasPermission(BASIC_USER, 'posts', 'view')
      expect(result).toBe(true)
    })
  })

  describe('users', () => {
    it('should not allow create', () => {
      const result = hasPermission(BASIC_USER, 'users', 'create')
      expect(result).toBe(false)
    })

    it('should not allow delete', () => {
      const result = hasPermission(BASIC_USER, 'users', 'delete')
      expect(result).toBe(false)
    })

    it('should allow delete:self', () => {
      const result = hasPermission(
        BASIC_USER,
        'users',
        'delete:self',
        BASIC_USER,
      )
      expect(result).toBe(true)
    })

    it('should not allow delete other', () => {
      const result = hasPermission(
        BASIC_USER,
        'users',
        'delete:self',
        ADMIN_USER,
      )
      expect(result).toBe(false)
    })

    it('should not allow update', () => {
      const result = hasPermission(BASIC_USER, 'users', 'update')
      expect(result).toBe(false)
    })

    it('should not allow view', () => {
      const result = hasPermission(BASIC_USER, 'users', 'view')
      expect(result).toBe(false)
    })

    it('should allow view:self', () => {
      const result = hasPermission(BASIC_USER, 'users', 'view:self', BASIC_USER)
      expect(result).toBe(true)
    })

    it('should not allow view other', () => {
      const result = hasPermission(BASIC_USER, 'users', 'view:self', ADMIN_USER)
      expect(result).toBe(false)
    })
  })
})

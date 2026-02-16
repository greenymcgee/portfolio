import { ADMIN_USER, BASIC_USER } from '@/test/fixtures'

import { POLICIES } from '../constants'
import { hasPermission } from '../hasPermission'

describe('admin permissions', () => {
  describe('posts', () => {
    it.each(Object.keys(POLICIES.ADMIN.posts))('should allow all', (key) => {
      const result = hasPermission(
        ADMIN_USER,
        'posts',
        key as keyof typeof POLICIES.ADMIN.posts,
      )
      expect(result).toBe(true)
    })
  })

  describe('users', () => {
    it('should allow create', () => {
      const result = hasPermission(ADMIN_USER, 'users', 'create')
      expect(result).toBe(true)
    })

    it('should allow delete', () => {
      const result = hasPermission(ADMIN_USER, 'users', 'delete')
      expect(result).toBe(true)
    })

    it('should allow update', () => {
      const result = hasPermission(ADMIN_USER, 'users', 'update')
      expect(result).toBe(true)
    })

    it('should not allow view', () => {
      const result = hasPermission(ADMIN_USER, 'users', 'view')
      expect(result).toBe(false)
    })

    it('should allow view:self', () => {
      const result = hasPermission(ADMIN_USER, 'users', 'view:self', ADMIN_USER)
      expect(result).toBe(true)
    })

    it('should not allow view other', () => {
      const result = hasPermission(ADMIN_USER, 'users', 'view:self', BASIC_USER)
      expect(result).toBe(false)
    })
  })
})

import { ADMIN_USER } from '@/test/fixtures'

import { hasPermission } from '..'

describe('hasPermission', () => {
  it('should return false if the resource is blank', () => {
    // @ts-expect-error: for test
    const result = hasPermission(ADMIN_USER, 'nothing', 'create')
    expect(result).toBe(false)
  })

  it('should return the boolean when it is present', () => {
    const result = hasPermission(ADMIN_USER, 'posts', 'create')
    expect(result).toBe(true)
  })
})

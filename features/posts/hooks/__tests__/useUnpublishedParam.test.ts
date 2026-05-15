import { renderHook } from '@testing-library/react'
import mockRouter from 'next-router-mock'

import { ROUTES } from '@/globals/constants'

import { useUnpublishedParam } from '../useUnpublishedParam'

beforeEach(() => {
  mockRouter.push(ROUTES.posts)
})

describe('useUnpublishedParam()', () => {
  it('should return false when ?unpublished is absent', () => {
    const { result } = renderHook(() => useUnpublishedParam())
    expect(result.current).toBe(false)
  })

  it('should return true when ?unpublished=true', () => {
    mockRouter.push(ROUTES.unpublishedPosts)
    const { result } = renderHook(() => useUnpublishedParam())
    expect(result.current).toBe(true)
  })

  it('should return false when ?unpublished has a non-true value', () => {
    mockRouter.push(`${ROUTES.posts}?unpublished=false`)
    const { result } = renderHook(() => useUnpublishedParam())
    expect(result.current).toBe(false)
  })
})

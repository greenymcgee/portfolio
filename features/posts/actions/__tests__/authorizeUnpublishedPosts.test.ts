import { redirect } from 'next/navigation'

import { ROUTES } from '@/globals/constants'
import { mockServerSession } from '@/test/helpers/utils/mockServerSession'

import { authorizeUnpublishedPosts } from '..'

beforeEach(() => {
  vi.mocked(redirect).mockClear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('authorizeUnpublishedPosts', () => {
  it('should return a null error when unpublished Posts are not requested', async () => {
    const result = await authorizeUnpublishedPosts({})
    expect(result).toEqual({ error: null })
    expect(redirect).not.toHaveBeenCalled()
  })

  it('should return a null error when unpublished is explicitly false', async () => {
    const result = await authorizeUnpublishedPosts({ unpublished: 'false' })
    expect(result).toEqual({ error: null })
    expect(redirect).not.toHaveBeenCalled()
  })

  it('should return a flattened ZodError when unpublished is not a boolean', async () => {
    const invalidParams = { unpublished: 'not-true' }
    const result = await authorizeUnpublishedPosts(invalidParams)
    expect(result).toEqual({
      error: { fieldErrors: expect.any(Object), formErrors: expect.any(Array) },
    })
    expect(redirect).not.toHaveBeenCalled()
  })

  it('should redirect to the login page with a return path when unpublished Posts are requested and there is no session', async () => {
    await authorizeUnpublishedPosts({ unpublished: 'true' })
    expect(redirect).toHaveBeenCalledWith(
      ROUTES.loginWithRedirect(ROUTES.unpublishedPosts),
    )
  })

  it('should return a null error when unpublished Posts are requested and an admin User is authorized', async () => {
    mockServerSession('ADMIN')
    const result = await authorizeUnpublishedPosts({ unpublished: 'true' })
    expect(result).toEqual({ error: null })
    expect(redirect).not.toHaveBeenCalled()
  })

  it('should redirect to the posts index when unpublished Posts are requested and the User is forbidden', async () => {
    mockServerSession('USER')
    await authorizeUnpublishedPosts({ unpublished: 'true' })
    expect(redirect).toHaveBeenCalledWith(ROUTES.posts)
  })
})

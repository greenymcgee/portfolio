import { NextRequest, NextResponse } from 'next/server'

import proxy from './proxy'
import { mockServerSession } from './test/helpers/utils'

vi.spyOn(NextResponse, 'redirect')
vi.spyOn(NextResponse, 'next')

beforeEach(() => {
  vi.clearAllMocks()
})

afterAll(() => {
  vi.restoreAllMocks()
  mockServerSession(null)
})

const TEST_URL = 'http://test-nothing.greeny/anything'

describe('proxy', () => {
  describe('authentication', () => {
    it('should allow an authenticated user to continue', async () => {
      mockServerSession('ADMIN')
      await proxy(new NextRequest(new URL(TEST_URL)))
      expect(NextResponse.next).toHaveBeenCalled()
    })

    it('should redirect an unauthenticated user', async () => {
      mockServerSession(null)
      await proxy(new NextRequest(TEST_URL))
      const url = new URL('http://test-nothing.greeny/login')
      url.searchParams.set('redirect', '/anything')
      expect(NextResponse.redirect).toHaveBeenCalledWith(url)
    })
  })

  describe('authorization', () => {
    it('should respect the admin route policy', async () => {
      mockServerSession('USER')
      await proxy(new NextRequest(TEST_URL))
      expect(NextResponse.redirect).toHaveBeenCalledWith(
        new URL('http://test-nothing.greeny/'),
      )
    })
  })
})

import { faker } from '@faker-js/faker'
import * as NextServer from 'next/server'

import { HTTP_TEXT_BY_STATUS, NO_CONTENT, SUCCESS } from '@/globals/constants'

import { createResponse } from '..'

const { NextResponse } = NextServer
const PARAMS: FirstParameterOf<typeof createResponse> = {
  status: SUCCESS,
  url: 'http://test-greeny.no',
}
const STATUS_TEXT = HTTP_TEXT_BY_STATUS[PARAMS.status]

vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server')
  const MockNextResponse = vi.fn(function (this: unknown) {
    return {}
  })
  Object.assign(MockNextResponse, actual.NextResponse, { json: vi.fn() })
  return { ...actual, NextResponse: MockNextResponse }
})

describe('createResponse', () => {
  it('should return the expected response with minimal input', () => {
    createResponse(PARAMS)
    expect(NextResponse.json).toHaveBeenCalledWith(
      { message: STATUS_TEXT },
      { status: PARAMS.status, statusText: STATUS_TEXT, url: PARAMS.url },
    )
  })

  it('should accept a body', () => {
    const body = { test: 'test' }
    createResponse({ ...PARAMS, body })
    expect(NextResponse.json).toHaveBeenCalledWith(
      { ...body, message: STATUS_TEXT },
      { status: PARAMS.status, statusText: STATUS_TEXT, url: PARAMS.url },
    )
  })

  it('should accept headers', () => {
    const headers = { Cookie: faker.string.alphanumeric({ length: 24 }) }
    createResponse({ ...PARAMS, headers })
    expect(NextResponse.json).toHaveBeenCalledWith(
      { message: STATUS_TEXT },
      {
        headers,
        status: PARAMS.status,
        statusText: STATUS_TEXT,
        url: PARAMS.url,
      },
    )
  })

  it('should accept a statusText', () => {
    const statusText = 'message'
    createResponse({ ...PARAMS, statusText })
    expect(NextResponse.json).toHaveBeenCalledWith(
      { message: statusText },
      { status: PARAMS.status, statusText, url: PARAMS.url },
    )
  })

  it('should accept a message', () => {
    const message = 'message'
    createResponse({ ...PARAMS, message })
    expect(NextResponse.json).toHaveBeenCalledWith(
      { message },
      { status: PARAMS.status, statusText: STATUS_TEXT, url: PARAMS.url },
    )
  })

  it('should accept a nextConfig', () => {
    const nextConfig = { basePath: '/api' }
    createResponse({ ...PARAMS, nextConfig })
    expect(NextResponse.json).toHaveBeenCalledWith(
      { message: STATUS_TEXT },
      {
        nextConfig,
        status: PARAMS.status,
        statusText: STATUS_TEXT,
        url: PARAMS.url,
      },
    )
  })

  it('should handle a not found response', () => {
    createResponse({ ...PARAMS, status: NO_CONTENT })
    expect(NextResponse).toHaveBeenCalledWith(null, {
      status: NO_CONTENT,
      statusText: HTTP_TEXT_BY_STATUS[NO_CONTENT],
      url: PARAMS.url,
    })
  })
})

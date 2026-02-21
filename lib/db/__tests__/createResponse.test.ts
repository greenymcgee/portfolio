import { faker } from '@faker-js/faker'
import { NextResponse } from 'next/server'

import { HTTP_TEXT_BY_STATUS, SUCCESS } from '@/constants'

import { createResponse } from '..'

const PARAMS: FirstParameterOf<typeof createResponse> = {
  status: SUCCESS,
  url: 'http://test-greeny.no',
}
const STATUS_TEXT = HTTP_TEXT_BY_STATUS[PARAMS.status]

vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server')
  // @ts-expect-error: this is doing what we need it to
  return { ...actual, NextResponse: { ...actual.NextResponse, json: vi.fn() } }
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
})

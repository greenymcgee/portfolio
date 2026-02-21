import { NextResponse } from 'next/server'

import { HTTP_TEXT_BY_STATUS } from '@/constants'

type JSONOptions = Omit<
  NonNullable<SecondParameterOf<typeof NextResponse.json>>,
  'status' | 'url'
>

interface Params extends JSONOptions {
  /**
   * Use this to send any custom data in the response.
   */
  body?: Record<string, unknown>
  /**
   * An optional message to pass in the request. Defaults to the statusText.
   */
  message?: string
  /**
   * An HTTP status code.
   */
  status: keyof typeof HTTP_TEXT_BY_STATUS
  /**
   * Optional statusText. Defaults to the map value.
   */
  statusText?: string
  /**
   * The request URL.
   */
  url: string
}

/**
 * Creates consistent NextResponses by requiring a status and a url. The status
 * is used to build a message and statusText by default.
 *
 * @param {Params} params - object
 * @returns {NextResponse['json']} JSON
 */
export function createResponse({
  body,
  headers,
  status,
  statusText = HTTP_TEXT_BY_STATUS[status],
  message = statusText,
  nextConfig,
  url,
}: Params) {
  return NextResponse.json(
    { ...body, message },
    { headers, nextConfig, status, statusText, url },
  )
}

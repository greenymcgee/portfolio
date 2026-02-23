'use server'

import { tryCatch } from '@greenymcgee/typescript-utils'
import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

import { AUTH_SECRET } from '@/constants'

import { logger } from '../logger'

const MILLISECONDS_IN_ONE_SECOND = 1000

export async function authenticateAPISession(request: Request) {
  const { error, response: token } = await tryCatch(
    getToken({
      req: new NextRequest(request.url, { headers: request.headers }),
      secret: AUTH_SECRET,
    }),
  )
  if (error) {
    logger.error({ error }, 'AUTHENTICATE_API_SESSION_ERROR')
    return null
  }

  if (!token) return null

  if (new Date(token.exp * MILLISECONDS_IN_ONE_SECOND) < new Date()) return null

  return token
}

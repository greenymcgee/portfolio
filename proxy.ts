import { NextRequest, NextResponse } from 'next/server'

import { ROUTES } from './constants'
import { authenticateAPISession } from './lib/auth'
import { redirectUnauthenticatedUser } from './lib/next'

export default async function proxy(request: NextRequest) {
  const user = await authenticateAPISession()
  if (!user) return redirectUnauthenticatedUser(request)

  if (!user.roles.includes('ADMIN')) {
    return NextResponse.redirect(new URL(ROUTES.home, request.url))
  }

  return NextResponse.next()
}

export const config = { matcher: ['/posts/new', '/register', '/users/new'] }

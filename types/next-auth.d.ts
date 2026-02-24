import { ISODateString } from 'next-auth'

import type { User } from '@/prisma/generated/client'

declare module 'next-auth' {
  interface Session {
    expires: ISODateString
    token: {
      email: GeneratedUser['email']
      firstName: GeneratedUser['firstName']
      id: string
      lastName: GeneratedUser['lastName']
      roles: GeneratedUser['roles']
      sub: string
      username: GeneratedUser['username']
      iat: number
      exp: number
      jti: string
    }
    user: Pick<
      User,
      'email' | 'firstName' | 'id' | 'lastName' | 'roles' | 'username'
    >
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    email: GeneratedUser['email']
    firstName: GeneratedUser['firstName']
    id: string
    lastName: GeneratedUser['lastName']
    roles: GeneratedUser['roles']
    sub: string
    username: GeneratedUser['username']
    iat: number
    exp: number
    jti: string
  }
}

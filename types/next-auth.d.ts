import { ISODateString } from 'next-auth'

import type { User } from '@/prisma/generated/client'

declare module 'next-auth' {
  interface Session {
    expires: ISODateString
    token: {
      email: User['email']
      firstName: User['firstName']
      id: string
      lastName: User['lastName']
      roles: User['roles']
      sub: string
      username: User['username']
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
    email: User['email']
    firstName: User['firstName']
    id: string
    lastName: User['lastName']
    roles: User['roles']
    sub: string
    username: User['username']
    iat: number
    exp: number
    jti: string
  }
}

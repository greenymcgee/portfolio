import { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

import { jwtCallback } from './lib/auth/jwtCallback'
import { sessionCallback } from './lib/auth/sessionCallback'
import { verifyLoginRequest } from './lib/auth/verifyLoginRequest'

export const authOptions = {
  callbacks: { jwt: jwtCallback, session: sessionCallback },
  // @ts-expect-error: this was present in the template setup. Leaving till I know more.
  name: 'credentials',
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      authorize: verifyLoginRequest,
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
    }),
  ],
} satisfies NextAuthOptions

import { CallbacksOptions, type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

import { jwtCallback } from './lib/auth/jwtCallback'
import { sessionCallback } from './lib/auth/sessionCallback'
import { verifyLoginRequest } from './lib/auth/verifyLoginRequest'

const ONE_DAY_SECONDS = 60 * 60 * 24

export const authOptions = {
  callbacks: {
    /**
     * The "jwt" property has a hard-typed User that is the DefaultUser which
     * differs from the User that is actually what is returned.
     */
    jwt: jwtCallback as unknown as CallbacksOptions['jwt'],
    session: sessionCallback,
  },
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
  session: { maxAge: ONE_DAY_SECONDS },
} satisfies NextAuthOptions

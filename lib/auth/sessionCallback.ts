/* eslint-disable require-await */
import { CallbacksOptions, Session } from 'next-auth'

import { User } from '@/prisma/generated/client'

type Callback = Omit<FirstParameterOf<CallbacksOptions['session']>, 'session'>

interface Params extends Callback {
  session: Session & { user: User }
}

/**
 * This fires any time we try to access the session. Once the token is set, the
 * token user populates the session user. The session user is set to the
 * NextAuth default User which only shares the email property.
 */
export async function sessionCallback({ session, token }: Params) {
  return {
    expires: session.expires,
    token,
    user: {
      email: session.user.email,
      firstName: token.firstName,
      id: token.id,
      lastName: token.lastName,
      roles: token.roles,
      username: token.username,
    },
  }
}

/* eslint-enable require-await */

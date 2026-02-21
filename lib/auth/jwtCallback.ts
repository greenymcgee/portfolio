/* eslint-disable require-await */
import { CallbacksOptions } from 'next-auth'

import { User } from '@/prisma/generated/client'

type CallbackParams = Omit<FirstParameterOf<CallbacksOptions['jwt']>, 'user'>

interface Params extends CallbackParams {
  user: User
}

/**
 * The token is set to a default user with only the email and sub defined the
 * first time it fires, and the user is fully loaded. On subsequent fires, the
 * token is set to the user from the first go round, and the user is undefined.
 */
export async function jwtCallback({ token, user }: Params) {
  if (user) {
    return {
      email: user.email,
      firstName: user.firstName,
      id: user.id,
      lastName: user.lastName,
      roles: user.roles,
      username: user.username,
    }
  }

  return token
}

/* eslint-enable require-await */

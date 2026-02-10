/* eslint-disable require-await */
import { CallbacksOptions } from 'next-auth'

type Params = FirstParameterOf<CallbacksOptions['jwt']>

/**
 * This is setup the same way that the Vercel template set up the jwt callback.
 */
export async function jwtCallback({ token, user }: Params) {
  return { ...token, id: token.id ?? user?.id }
}

/* eslint-enable require-await */

/* eslint-disable require-await */
import { CallbacksOptions } from 'next-auth'

type Params = FirstParameterOf<CallbacksOptions['session']>

/**
 * This is setup the same way that the Vercel template set up the session callback.
 */
export async function sessionCallback({ session, token }: Params) {
  return { ...session, user: { ...session.user, id: token.id } }
}

/* eslint-enable require-await */

'use server'

import { redirect } from 'next/navigation'
import { flattenError, object, stringbool } from 'zod'

import { ROUTES } from '@/globals/constants'
import { authenticateAPISession } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'

type Params = { unpublished?: string }

const schema = object({
  unpublished: stringbool()
    .optional()
    .transform((value) => value ?? false),
})

/**
 * Authorizes unpublished Posts outside of any cached requests.
 */
export async function authorizeUnpublishedPosts(params: Params) {
  const { data, error } = schema.safeParse(params)
  if (error) return { error: flattenError(error) }

  if (!data.unpublished) return { error: null }

  const user = await authenticateAPISession()
  if (user === null) {
    return redirect(ROUTES.loginWithRedirect(ROUTES.unpublishedPosts))
  }

  if (hasPermission(user, 'posts', 'view:unpublished')) return { error: null }

  return redirect(ROUTES.posts)
}

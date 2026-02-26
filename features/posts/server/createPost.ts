'use server'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { FORBIDDEN, UNAUTHORIZED } from '@/constants'
import { ROUTES } from '@/constants/routes'

import { postCreateSchema } from '../schemas'
import { PostCreateState } from '../types'
import { getPostCreateFormValues, tryPostNewPost } from '../utils'

type State = PostCreateState

export async function createPost(_: State, formData: FormData): Promise<State> {
  const formValues = getPostCreateFormValues(formData)
  const validate = postCreateSchema.safeParse(formValues)
  if (validate.error) {
    return { ...formValues, error: validate.error, status: 'ERROR' }
  }

  const headersList = await headers()
  const cookie = headersList.get('cookie')
  if (!cookie) return redirect(ROUTES.login)

  const { error, response } = await tryPostNewPost(validate.data, cookie)
  if (!error) return redirect(ROUTES.post(response.data.post.id))

  if (error.response.status === UNAUTHORIZED) return redirect(ROUTES.login)

  if (error.response.status === FORBIDDEN) return redirect(ROUTES.home)

  return { ...formValues, status: 'ERROR' }
}

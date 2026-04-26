'use server'

import { redirect } from 'next/navigation'
import { flattenError } from 'zod'

import { ROUTES } from '@/globals/constants'
import { logger } from '@/lib/logger'

import { CreateUserDto } from '../dto'
import { CreateUserState } from '../types'
import { UserService } from '../user.service'

type State = CreateUserState

export async function createUser(_: State, formData: FormData): Promise<State> {
  const { password, ...formValues } = Object.fromEntries(formData)
  void password

  const result = await UserService.create(new CreateUserDto(formData))
  return result.match(
    () => redirect(ROUTES.login),
    (error) => {
      switch (error.type) {
        case 'dto': {
          return {
            ...formValues,
            error: flattenError(error.details),
            status: 'ERROR',
          } satisfies State
        }
        case 'entity':
        case 'error': {
          return { ...formValues, status: 'ERROR' } satisfies State
        }
        default: {
          logger.error(
            { error: error satisfies never },
            'UNHANDLED_CREATE_USER_ERROR',
          )
          return { ...formValues, status: 'ERROR' } satisfies State
        }
      }
    },
  )
}

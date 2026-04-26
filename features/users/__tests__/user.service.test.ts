/* eslint-disable neverthrow/must-use-result */
import { Err, Ok } from 'neverthrow'
import { ZodError } from 'zod'

import { CREATED, UNPROCESSABLE_CONTENT } from '@/globals/constants'
import { PrismaError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { userFactory } from '@/test/factories'

import { CreateUserDto } from '../dto/create-user.dto'
import type { CreateUserParams } from '../schemas'
import { UserRepository } from '../user.repository'
import { UserService } from '../user.service'

vi.mock('../user.repository', () => ({
  UserRepository: { create: vi.fn() },
}))

interface FormValues {
  email: string
  firstName: string
  lastName: string
  password: string
  username: string
}

function buildFormData(values: FormValues) {
  const formData = new FormData()
  formData.set('email', values.email)
  formData.set('firstName', values.firstName)
  formData.set('lastName', values.lastName)
  formData.set('password', values.password)
  formData.set('username', values.username)
  return formData
}

describe('UserService', () => {
  describe('create', () => {
    it('should return a dto error when the repository returns a Zod error', async () => {
      const zodError = new ZodError([])
      vi.mocked(UserRepository.create).mockResolvedValueOnce(
        zodError as ZodError<CreateUserParams>,
      )
      const user = userFactory.build({ password: 'Testpass1!' })
      const result = await UserService.create(
        new CreateUserDto(buildFormData(user)),
      )
      expect(result).toEqual(
        new Err({
          details: zodError,
          status: UNPROCESSABLE_CONTENT,
          type: 'dto',
        }),
      )
    })

    it('should return a PrismaError when the repository returns one', async () => {
      const error = new PrismaError(new Error('bad'))
      vi.mocked(UserRepository.create).mockResolvedValueOnce(error)
      const user = userFactory.build({ password: 'Testpass1!' })
      const result = await UserService.create(
        new CreateUserDto(buildFormData(user)),
      )
      expect(result).toEqual(
        new Err({
          details: error.details,
          status: error.status,
          type: 'entity',
        }),
      )
    })

    it('should return an error when the repository returns a generic error', async () => {
      const error = new Error('UserRepository bcrypt failed')
      vi.mocked(UserRepository.create).mockResolvedValueOnce(error)
      const user = userFactory.build({ password: 'Testpass1!' })
      const result = await UserService.create(
        new CreateUserDto(buildFormData(user)),
      )
      expect(result).toEqual(
        new Err({
          details: error,
          status: UNPROCESSABLE_CONTENT,
          type: 'error',
        }),
      )
      expect(logger.error).toHaveBeenCalledWith({ error }, 'UserService error:')
    })

    it('should return created and omit the password from the user payload', async () => {
      const user = userFactory.build({ password: 'hashed' })
      vi.mocked(UserRepository.create).mockResolvedValueOnce(user)
      const formUser = userFactory.build({ password: 'Testpass1!' })
      const result = await UserService.create(
        new CreateUserDto(buildFormData(formUser)),
      )
      const { password, ...publicUser } = user
      void password
      expect(result).toEqual(new Ok({ status: CREATED, user: publicUser }))
    })
  })
})

/* eslint-enable neverthrow/must-use-result */

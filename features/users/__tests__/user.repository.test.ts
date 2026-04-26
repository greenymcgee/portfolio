import bcrypt from 'bcryptjs'
import { ZodError } from 'zod'

import { PrismaError } from '@/lib/errors'
import { logger } from '@/lib/logger'
import { userFactory } from '@/test/factories'
import { prismaMock } from '@/test/mocks/prisma-mock'

import { CreateUserDto } from '../dto/create-user.dto'
import { UserRepository } from '../user.repository'

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

afterEach(() => {
  vi.restoreAllMocks()
})

describe('UserRepository', () => {
  describe('create', () => {
    it('should return a Zod error', async () => {
      const dto = new CreateUserDto(new FormData())
      const result = await UserRepository.create(dto)
      expect(result).toEqual(expect.any(ZodError))
    })

    it('should return a hash error when bcrypt hash fails', async () => {
      const error = new Error('UserRepository bcrypt failed')
      vi.spyOn(bcrypt, 'hash').mockRejectedValueOnce(error)
      const dto = new CreateUserDto(
        buildFormData(userFactory.build({ password: 'Testpass1!' })),
      )
      const result = await UserRepository.create(dto)
      expect(result).toBe(error)
      expect(logger.error).toHaveBeenCalledWith(
        { error },
        'UserRepository password hash error:',
      )
    })

    it('should return a Prisma error', async () => {
      const error = new Error('Bad')
      prismaMock.user.create.mockRejectedValueOnce(error)
      const dto = new CreateUserDto(
        buildFormData(userFactory.build({ password: 'Testpass1!' })),
      )
      const result = await UserRepository.create(dto)
      const prismaError = new PrismaError(error)
      expect(result).toEqual(new PrismaError(error))
      expect(logger.error).toHaveBeenCalledWith(
        { details: prismaError.details, status: prismaError.status },
        'UserRepository Prisma error:',
      )
    })

    it('should hash the password and return the created user', async () => {
      const user = userFactory.build()
      prismaMock.user.create.mockResolvedValueOnce(user)
      const password = 'Testpass1!'
      const hashSpy = vi.spyOn(bcrypt, 'hash')
      const dto = new CreateUserDto(
        buildFormData(userFactory.build({ password })),
      )
      const result = await UserRepository.create(dto)
      expect(result).toBe(user)
      expect(hashSpy).toHaveBeenCalledWith(password, 10)
    })
  })
})

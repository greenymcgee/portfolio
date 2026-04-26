import { faker } from '@faker-js/faker'
import bcrypt from 'bcryptjs'
import { errAsync } from 'neverthrow'
import { redirect } from 'next/navigation'
import { flattenError, ZodError } from 'zod'

import { UserService } from '@/features/users/user.service'
import {
  INTERNAL_SERVER_ERROR,
  ROUTES,
  UNPROCESSABLE_CONTENT,
} from '@/globals/constants'
import { logger } from '@/lib/logger'
import { prisma } from '@/lib/prisma'
import { userFactory } from '@/test/factories'
import { ADMIN_USER } from '@/test/fixtures'
import { setupTestDatabase } from '@/test/helpers/utils'

import { createUser } from '..'

type CreateUserReturn = Awaited<ReturnType<typeof UserService.create>>

let createSpy: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  createSpy = vi.spyOn(UserService, 'create')
})

afterEach(() => {
  vi.restoreAllMocks()
})

const STATE = { status: 'IDLE' } as const

describe('createUser', () => {
  it('should return a dto error when the service returns a Zod error', async () => {
    const zodError = new ZodError([])
    createSpy.mockResolvedValueOnce(
      errAsync({
        details: zodError,
        status: UNPROCESSABLE_CONTENT,
        type: 'dto',
      } as const) as unknown as CreateUserReturn,
    )
    const result = await createUser(STATE, new FormData())
    expect(result).toEqual({ error: flattenError(zodError), status: 'ERROR' })
  })

  it('should return an error status when the service returns an entity error', async () => {
    createSpy.mockResolvedValueOnce(
      errAsync({
        details: {},
        status: INTERNAL_SERVER_ERROR,
        type: 'entity',
      } as const) as unknown as CreateUserReturn,
    )
    const result = await createUser(STATE, new FormData())
    expect(result).toEqual({ status: 'ERROR' })
  })

  it('should return an error status when the service returns a generic error', async () => {
    createSpy.mockResolvedValueOnce(
      errAsync({
        details: {},
        status: UNPROCESSABLE_CONTENT,
        type: 'error',
      } as const) as unknown as CreateUserReturn,
    )
    const result = await createUser(STATE, new FormData())
    expect(result).toEqual({ status: 'ERROR' })
  })

  it('should return an error status when the service returns an unknown error', async () => {
    const unexpected = {
      details: {},
      status: INTERNAL_SERVER_ERROR,
      type: 'forbidden',
    } as const
    createSpy.mockResolvedValueOnce(
      errAsync(unexpected) as unknown as CreateUserReturn,
    )
    const result = await createUser(STATE, new FormData())
    expect(result).toEqual({ status: 'ERROR' })
    expect(logger.error).toHaveBeenCalled()
  })

  describe('integration', () => {
    setupTestDatabase({ mutatesData: true, withUsers: true })

    it('should create the user, hash the password, and redirect to /login', async () => {
      const formValues = userFactory.build({ password: 'Testpass1!' })
      const formData = new FormData()
      formData.set('email', formValues.email)
      formData.set('firstName', formValues.firstName)
      formData.set('lastName', formValues.lastName)
      formData.set('password', formValues.password)
      formData.set('username', formValues.username)
      await createUser({ status: 'IDLE' }, formData)
      const persisted = await prisma.user.findUnique({
        where: { email: formValues.email },
      })
      expect(
        await bcrypt.compare(formValues.password, persisted?.password ?? ''),
      ).toBe(true)
      expect(redirect).toHaveBeenCalledWith(ROUTES.login)
    })

    it('should return ERROR when a duplicate email is submitted', async () => {
      const formData = new FormData()
      formData.set('email', ADMIN_USER.email)
      formData.set('firstName', faker.person.firstName())
      formData.set('lastName', faker.person.lastName())
      formData.set('password', 'Testpass1!')
      formData.set('username', `${faker.animal.bear()}_${Date.now()}`)
      const result = await createUser({ status: 'IDLE' }, formData)
      expect(result).toEqual(expect.objectContaining({ status: 'ERROR' }))
      expect(result.error).toBeUndefined()
    })
  })
})

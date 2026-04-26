import { ZodError } from 'zod'

import { logger } from '@/lib/logger'
import { userFactory } from '@/test/factories'

import { CreateUserDto } from '../create-user.dto'

describe('CreateUserDto', () => {
  describe('params', () => {
    it('should return a Zod error when params are invalid', () => {
      const dto = new CreateUserDto(new FormData())
      const result = dto.params
      expect(result).toEqual(expect.any(ZodError))
      expect(logger.error).toHaveBeenCalledWith(
        { error: expect.any(ZodError) },
        'CreateUserDto Zod error:',
      )
    })

    it('should return validated params on success', () => {
      const user = userFactory.build({ password: 'Testpass1!' })
      const formData = new FormData()
      formData.set('email', user.email)
      formData.set('firstName', user.firstName)
      formData.set('lastName', user.lastName)
      formData.set('password', user.password)
      formData.set('username', user.username)
      const result = new CreateUserDto(formData).params
      expect(result).toEqual({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        password: user.password,
        username: user.username,
      })
    })
  })
})

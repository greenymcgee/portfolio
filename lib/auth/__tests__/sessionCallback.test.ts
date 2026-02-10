import { userFactory } from '@/test/factories'

import { sessionCallback } from '../sessionCallback'

describe('sessionCallback', () => {
  it('should return the session and replace the user id with the token id', async () => {
    const user = userFactory.build()
    const session = { expires: '', user }
    const token = { email: 'email', id: 'token-id' }
    const result = await sessionCallback({
      newSession: '',
      session,
      token,
      trigger: 'update',
      user: { ...user, emailVerified: new Date() },
    })
    expect(result).toEqual({ ...session, user: { ...user, id: token.id } })
  })
})

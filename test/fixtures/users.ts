import { userFactory } from '../factories'

export const ADMIN_USER = userFactory.build({
  email: 'bart@test.com',
  firstName: 'Bart',
  lastName: 'Simpson',
  password: 'Testpass1!',
  roles: ['ADMIN', 'USER'],
  username: 'eatmyshorts',
})

export const BASIC_USER = userFactory.build({
  email: 'ned@test.com',
  firstName: 'Ned',
  lastName: 'Flanders',
  password: 'Testpass1!',
  roles: ['USER'],
  username: 'theflanman',
})

export const USERS = [ADMIN_USER, BASIC_USER]

import { Policies } from './types'

export const POLICIES = {
  ADMIN: {
    posts: {
      create: true,
      delete: true,
      publish: true,
      update: true,
      view: true,
    },
    users: {
      create: true,
      delete: true,
      update: true,
      view: false,
      'view:self': (user, viewedUser) => user.id === viewedUser.id,
    },
  },
  USER: {
    posts: {
      create: false,
      delete: false,
      publish: false,
      update: false,
      view: true,
    },
    users: {
      create: false,
      delete: false,
      'delete:self': (user, deletedUser) => user.id === deletedUser.id,
      update: false,
      view: false,
      'view:self': (user, viewedUser) => user.id === viewedUser.id,
    },
  },
} as const satisfies Policies

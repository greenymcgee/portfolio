import { Post, User } from '@/prisma/generated/client'

export interface PortfolioPermissions {
  posts: {
    action: 'create' | 'delete' | 'publish' | 'update' | 'view'
    type: Post
  }
  users: {
    action:
      | 'create'
      | 'delete'
      | 'delete:self'
      | 'update'
      | 'view'
      | 'view:self'
    type: User
  }
}

export type Role = OneOf<User['roles']>

export type PermissibleUser = Pick<User, 'email' | 'id' | 'roles'>

export type PermissionCheck<Key extends keyof PortfolioPermissions> =
  | boolean
  | ((
      user: PermissibleUser,
      data: PortfolioPermissions[Key]['type'],
    ) => boolean)

export type Policies = {
  [R in Role]: Partial<{
    [Key in keyof PortfolioPermissions]: Partial<{
      [Action in PortfolioPermissions[Key]['action']]: PermissionCheck<Key>
    }>
  }>
}

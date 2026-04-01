import { Post, User } from '@/prisma/generated/client'

export type AuthoredPost = Post & {
  author: Pick<User, 'firstName' | 'lastName'>
}

import { AuthoredPost } from './authoredPost'

export type FindAndCountPostsResponse = {
  message: string
  posts: AuthoredPost[]
  totalPages: number
}

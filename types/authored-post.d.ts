type AuthoredPost = {
  author: { firstName: string; lastName: string }
  authorId: string
  createdAt: Date
  content: runtime.JsonValue
  description: string
  id: number
  publishedAt: Date | null
  title: string
  updatedAt: Date
}

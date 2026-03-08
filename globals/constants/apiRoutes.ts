export const API_ROUTES = {
  authSession: '/auth/session',
  post: (id: number) => `/posts/${id}`,
  posts: '/posts',
} as const

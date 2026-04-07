export const API_ROUTES = {
  authLog: '/auth/_log',
  authSession: '/auth/session',
  post: (id: number) => `/posts/${id}`,
  posts: '/posts',
} as const

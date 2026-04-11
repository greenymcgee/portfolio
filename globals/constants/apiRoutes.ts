export const API_ROUTES = {
  authCsrf: '/auth/csrf',
  authLog: '/auth/_log',
  authSession: '/auth/session',
  authSignout: '/auth/signout',
  post: (id: number) => `/posts/${id}`,
  posts: '/posts',
} as const

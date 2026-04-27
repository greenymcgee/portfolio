export const API_ROUTES = {
  authCsrf: '/api/auth/csrf',
  authLog: '/api/auth/_log',
  authSession: '/api/auth/session',
  authSignout: '/api/auth/signout',
  post: (id: number) => `/api/posts/${id}`,
  posts: '/api/posts',
} as const

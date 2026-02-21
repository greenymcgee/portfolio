export const ROUTES = {
  home: '/',
  login: '/login',
  newPost: '/posts/new',
  newUser: '/users/new',
  post: (id: number) => `/posts/${id}`,
  posts: '/posts',
  register: '/register',
} as const

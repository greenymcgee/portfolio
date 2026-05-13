export const ROUTES = {
  home: '/',
  login: '/login',
  loginWithRedirect: (pathname: string) => `/login?redirect=${pathname}`,
  newPost: '/posts/new',
  newUser: '/users/new',
  post: (id: number) => `/posts/${id}`,
  posts: '/posts',
  register: '/register',
  unpublishedPosts: '/posts?unpublished=true',
} as const

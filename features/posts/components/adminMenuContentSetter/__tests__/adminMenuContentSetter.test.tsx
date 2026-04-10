import { render, screen } from '@testing-library/react'

import { AdminMenuContextProvider } from '@/providers'
import { AdminMenuContextWrapper } from '@/test/helpers/components'

import { PostsAdminMenuContentSetter } from '..'

describe('<PostsAdminMenuContentSetter />', () => {
  it('should set the AdminMenuContext.content', () => {
    render(<PostsAdminMenuContentSetter />, {
      wrapper: ({ children }) => (
        <AdminMenuContextProvider>
          <AdminMenuContextWrapper />
          {children}
        </AdminMenuContextProvider>
      ),
    })
    expect(screen.getByTestId('posts-admin-menu-content')).toBeVisible()
  })

  it('should unset the AdminMenuContext.content upon unmount', () => {
    const { unmount } = render(<PostsAdminMenuContentSetter />, {
      wrapper: ({ children }) => (
        <AdminMenuContextProvider>
          <AdminMenuContextWrapper />
          {children}
        </AdminMenuContextProvider>
      ),
    })
    unmount()
    expect(
      screen.queryByTestId('posts-admin-menu-content'),
    ).not.toBeInTheDocument()
  })
})

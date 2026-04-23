import { render, screen } from '@testing-library/react'

import { AdminMenuContextProvider } from '@/providers'
import { AdminMenuContextWrapper } from '@/test/helpers/components'

import { AdminMenuContentSetter } from '..'

describe('<AdminMenuContentSetter />', () => {
  it('should set the AdminMenuContext.content', () => {
    render(<AdminMenuContentSetter content={<div>content</div>} />, {
      wrapper: ({ children }) => (
        <AdminMenuContextProvider>
          <AdminMenuContextWrapper />
          {children}
        </AdminMenuContextProvider>
      ),
    })
    expect(screen.getByText('content')).toBeVisible()
  })

  it('should unset the AdminMenuContext.content upon unmount', () => {
    const text = 'content'
    const { unmount } = render(
      <AdminMenuContentSetter content={<div>{text}</div>} />,
      {
        wrapper: ({ children }) => (
          <AdminMenuContextProvider>
            <AdminMenuContextWrapper />
            {children}
          </AdminMenuContextProvider>
        ),
      },
    )
    unmount()
    expect(screen.queryByText(text)).not.toBeInTheDocument()
  })
})

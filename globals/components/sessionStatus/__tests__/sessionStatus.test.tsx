import { render, screen } from '@testing-library/react'

import { SessionStatus } from '..'

const { NODE_ENV } = process.env

afterEach(() => {
  vi.stubEnv('NODE_ENV', NODE_ENV)
})

describe('<SessionStatus />', () => {
  it('should not render in a non-test environment', () => {
    vi.stubEnv('NODE_ENV', 'production')
    const { container } = render(<SessionStatus status="authenticated" />)
    expect(container).toBeEmptyDOMElement()
  })

  it('should render in a test environment', () => {
    const status = 'authenticated'
    render(<SessionStatus status={status} />)
    expect(screen.getByText(status)).toBeVisible()
  })
})

import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/test/helpers/utils'

import { EditPostStatus } from '..'

describe('<EditPostStatus />', () => {
  it('should render nothing in idle state', () => {
    const { container } = renderWithProviders(
      <EditPostStatus saving={false} status="IDLE" />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('should render "Saving..." and a spinner while saving', () => {
    renderWithProviders(<EditPostStatus saving status="IDLE" />)
    expect(screen.getByText('Saving...')).toBeVisible()
    expect(screen.getByRole('status')).toBeVisible()
  })

  it('should render "Saved" after a successful save', () => {
    renderWithProviders(<EditPostStatus saving={false} status="SUCCESS" />)
    expect(screen.getByText('Saved')).toBeVisible()
  })

  it('should render an error message when the save fails', () => {
    renderWithProviders(<EditPostStatus saving={false} status="ERROR" />)
    expect(screen.getByText('Unable to save')).toBeVisible()
  })
})

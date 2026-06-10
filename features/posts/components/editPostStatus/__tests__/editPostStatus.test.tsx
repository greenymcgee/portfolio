import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/test/helpers/utils'

import { EditPostStatus } from '..'

const PROPS: PropsOf<typeof EditPostStatus> = {
  saving: false,
  status: 'IDLE',
  updatedAt: new Date(),
}

describe('<EditPostStatus />', () => {
  it('should show the spinner when saving after a previous error', () => {
    renderWithProviders(<EditPostStatus {...PROPS} saving status="ERROR" />)
    expect(screen.getByRole('status')).toBeVisible()
    expect(screen.queryByText('Unable to save')).not.toBeInTheDocument()
  })

  it('should render nothing in idle state', () => {
    renderWithProviders(
      <EditPostStatus {...PROPS} saving={false} status="IDLE" />,
    )
    expect(screen.getByTestId('edit-post-saved-status')).toBeVisible()
  })

  it('should render "Saving..." and a spinner while saving', () => {
    renderWithProviders(<EditPostStatus {...PROPS} saving status="IDLE" />)
    expect(screen.getByText('Saving...')).toBeVisible()
    expect(screen.getByRole('status')).toBeVisible()
  })

  it('should render "Saved" after a successful save', () => {
    renderWithProviders(
      <EditPostStatus {...PROPS} saving={false} status="SUCCESS" />,
    )
    expect(screen.getByText('Saved')).toBeVisible()
  })

  it('should render an error message when the save fails', () => {
    renderWithProviders(
      <EditPostStatus {...PROPS} saving={false} status="ERROR" />,
    )
    expect(screen.getByTestId('edit-post-save-error')).toBeVisible()
  })
})

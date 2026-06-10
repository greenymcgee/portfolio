import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/test/helpers/utils'

import { EditPostTitleError } from '..'

const PROPS: PropsOf<typeof EditPostTitleError> = { state: { status: 'IDLE' } }

describe('<EditPostTitleError />', () => {
  it('should render nothing when state is undefined', () => {
    const { container } = renderWithProviders(
      <EditPostTitleError state={undefined} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('should render nothing when state has no errors', () => {
    renderWithProviders(<EditPostTitleError {...PROPS} />)
    expect(
      screen.queryByTestId('unique-constraint-error'),
    ).not.toBeInTheDocument()
    expect(screen.queryByTestId('dto-title-error')).not.toBeInTheDocument()
  })

  it('should render a unique constraint error when the title is already taken', () => {
    renderWithProviders(
      <EditPostTitleError
        state={{ status: 'ERROR', threwUniqueConstraintError: true }}
      />,
    )
    expect(screen.getByTestId('unique-constraint-error')).toBeVisible()
  })

  it('should render a dto title error', () => {
    const titleError = 'Title is required'
    renderWithProviders(
      <EditPostTitleError
        state={{
          dtoError: { fieldErrors: { title: [titleError] }, formErrors: [] },
          status: 'ERROR',
        }}
      />,
    )
    expect(screen.getByTestId('dto-title-error')).toHaveTextContent(titleError)
  })
})

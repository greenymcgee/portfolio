import React, { PropsWithChildren, ReactElement } from 'react'
import { render } from '@testing-library/react'

import { TestProviders } from '../components'

type Options = SecondParameterOf<typeof render> & PropsOf<typeof TestProviders>

export function renderWithProviders(
  jsx: ReactElement,
  { wrapper: OptionalWrapper, ...rest }: Options = {},
) {
  function Wrapper({ children }: PropsWithChildren) {
    return (
      <TestProviders>
        {OptionalWrapper ? (
          <OptionalWrapper>{children}</OptionalWrapper>
        ) : (
          children
        )}
      </TestProviders>
    )
  }
  return render(jsx, { wrapper: Wrapper, ...rest })
}

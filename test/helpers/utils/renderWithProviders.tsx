import React, { PropsWithChildren, ReactElement } from 'react'
import { render } from '@testing-library/react'

import { TestProviders } from '../components'

type Options = SecondParameterOf<typeof render> & PropsOf<typeof TestProviders>

export function renderWithProviders(
  jsx: ReactElement,
  {
    includesSession,
    includesTheme,
    initialAdminMenuContent,
    themeProviderProps,
    wrapper: OptionalWrapper,
    ...rest
  }: Options = {},
) {
  function Wrapper({ children }: PropsWithChildren) {
    return (
      <TestProviders
        includesSession={includesSession}
        includesTheme={includesTheme}
        initialAdminMenuContent={initialAdminMenuContent}
        themeProviderProps={themeProviderProps}
      >
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

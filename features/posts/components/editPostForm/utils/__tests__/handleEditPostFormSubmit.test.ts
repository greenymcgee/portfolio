import type { SubmitEvent } from 'react'

import { handleEditPostFormSubmit } from '..'

describe('handleEditPostFormSubmit', () => {
  it('should prevent the default form submission', () => {
    const event = { preventDefault: vi.fn() } as unknown as SubmitEvent
    handleEditPostFormSubmit(event)
    expect(event.preventDefault).toHaveBeenCalledTimes(1)
  })
})

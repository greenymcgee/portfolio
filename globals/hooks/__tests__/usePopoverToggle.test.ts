import { act } from 'react'
import { renderHook } from '@testing-library/react'

import { usePopoverToggle } from '..'

describe('usePopoverToggle', () => {
  it('should return a toggle method and the expanded state', async () => {
    const dialog = document.createElement('dialog')
    document.body.appendChild(dialog)
    const ref = { current: dialog }
    const { result } = renderHook(() => usePopoverToggle(ref))
    await act(async () => await result.current.togglePopover())
    expect(result.current.expanded).toBe(true)
  })
})

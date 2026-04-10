import { debouncePopoverInteraction } from '..'

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
})

describe('debouncePopoverInteraction', () => {
  it('should clear the previous timeout when it is present', async () => {
    vi.spyOn(globalThis, 'clearTimeout')
    const timeout = setTimeout(() => null, 100)
    const params = {
      callback: vi.fn(),
      duration: 100,
      timeoutRef: { current: timeout },
    }
    debouncePopoverInteraction(params)
    await new Promise((resolve) => {
      return setTimeout(() => resolve(''), params.duration)
    })
    expect(clearTimeout).toHaveBeenCalledWith(timeout)
    expect(params.callback).toHaveBeenCalledTimes(1)
  })

  it('should set the ref to a new timeout', () => {
    const params = {
      callback: vi.fn(),
      duration: 100,
      timeoutRef: { current: null },
    }
    debouncePopoverInteraction(params)
    expect(params.timeoutRef.current).not.toBeNull()
  })
})

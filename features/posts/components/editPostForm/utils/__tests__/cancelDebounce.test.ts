import { cancelDebounce } from '..'

describe('cancelDebounce()', () => {
  it('should do nothing when timeoutRef is not set', () => {
    const timeoutRef = { current: null }
    expect(() => cancelDebounce(timeoutRef)).not.toThrow()
  })

  it('should clear the timeout and null the ref when set', () => {
    vi.useFakeTimers()
    const callback = vi.fn()
    const timeoutRef = { current: setTimeout(callback, 1000) }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    cancelDebounce(timeoutRef)
    vi.advanceTimersByTime(1000)
    expect(callback).not.toHaveBeenCalled()
    expect(timeoutRef.current).toBeNull()
    vi.useRealTimers()
  })
})

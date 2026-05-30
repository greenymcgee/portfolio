import { debounceAutosave } from '..'

const updateAction = vi.fn()

afterEach(() => {
  vi.resetAllMocks()
  vi.useRealTimers()
})

describe('debounceAutosave()', () => {
  it('should do nothing when formRef is not mounted', async () => {
    vi.useFakeTimers()
    const formRef = { current: null }
    const timeoutRef = { current: null }
    debounceAutosave({ formRef, timeoutRef, updateAction })
    await vi.advanceTimersByTimeAsync(1000)
    expect(updateAction).not.toHaveBeenCalled()
  })

  it('should call updateAction with form data after 1 second', async () => {
    vi.useFakeTimers()
    const form = document.createElement('form')
    const formRef = { current: form }
    const timeoutRef = { current: null }
    debounceAutosave({ formRef, timeoutRef, updateAction })
    expect(updateAction).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1000)
    expect(updateAction).toHaveBeenCalledTimes(1)
  })

  it('should reset the debounce timer when called again before 1 second', async () => {
    vi.useFakeTimers()
    const form = document.createElement('form')
    const formRef = { current: form }
    const timeoutRef = { current: null }
    debounceAutosave({ formRef, timeoutRef, updateAction })
    await vi.advanceTimersByTimeAsync(500)
    debounceAutosave({ formRef, timeoutRef, updateAction })
    await vi.advanceTimersByTimeAsync(1000)
    expect(updateAction).toHaveBeenCalledTimes(1)
  })
})

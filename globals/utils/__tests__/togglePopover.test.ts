import { togglePopover } from '..'

const toggleExpanded = vi.fn()

afterEach(() => {
  vi.clearAllMocks()
})

describe('togglePopover', () => {
  it('should do nothing if the dialog is blank', async () => {
    await togglePopover(null, toggleExpanded)
    expect(toggleExpanded).not.toHaveBeenCalled()
  })

  it('should open the dialog if it is closed', async () => {
    const dialog = document.createElement('dialog')
    document.body.appendChild(dialog)
    await togglePopover(dialog, toggleExpanded)
    expect(dialog.open).toBe(true)
    expect(toggleExpanded).toHaveBeenCalled()
  })

  it('should do nothing when opening if the dialog is not connected', async () => {
    const dialog = document.createElement('dialog')
    await togglePopover(dialog, toggleExpanded)
    expect(dialog.open).toBe(false)
    expect(toggleExpanded).not.toHaveBeenCalled()
  })

  it('should rethrow when showPopover throws a non-InvalidStateError', async () => {
    const dialog = document.createElement('dialog')
    document.body.appendChild(dialog)
    vi.spyOn(dialog, 'showPopover').mockImplementation(() => {
      throw new Error('showPopover failed')
    })
    await expect(togglePopover(dialog, toggleExpanded)).rejects.toThrow(
      'showPopover failed',
    )
    expect(toggleExpanded).not.toHaveBeenCalled()
  })

  it('should close the dialog if it is open', async () => {
    const dialog = document.createElement('dialog')
    dialog.open = true
    await togglePopover(dialog, toggleExpanded)
    expect(dialog.open).toBe(false)
    expect(toggleExpanded).toHaveBeenCalled()
  })

  describe('options', () => {
    it('should accept an animationDuration', async () => {
      const dialog = document.createElement('dialog')
      dialog.open = true
      await togglePopover(dialog, toggleExpanded, { animationDuration: 10 })
      expect(dialog.open).toBe(false)
      expect(toggleExpanded).toHaveBeenCalled()
    })
  })
})

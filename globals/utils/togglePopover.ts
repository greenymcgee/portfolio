interface Options {
  animationDuration?: number
}

interface DefaultOptions {
  animationDuration: NonNullable<Options['animationDuration']>
}

const DEFAULT_OPTIONS: DefaultOptions = {
  animationDuration: 0,
}

function handlePopoverHide(
  dialog: HTMLDialogElement,
  toggleExpanded: VoidFunction,
  options: Options,
) {
  const { animationDuration } = { ...DEFAULT_OPTIONS, ...options }
  return new Promise((resolve) => {
    setTimeout(() => {
      toggleExpanded()
      dialog.hidePopover()
      resolve(null)
    }, animationDuration)
  })
}

async function handlePopoverOpen(
  dialog: HTMLDialogElement,
  toggleExpanded: VoidFunction,
) {
  if (!dialog.isConnected) return

  dialog.showPopover()
  return await new Promise((resolve) => {
    setTimeout(() => resolve(toggleExpanded()))
  })
}

export async function togglePopover(
  dialog: HTMLDialogElement | null,
  toggleExpanded: VoidFunction,
  options: Options = DEFAULT_OPTIONS,
) {
  if (!dialog) return

  if (dialog.open)
    return await handlePopoverHide(dialog, toggleExpanded, options)

  return await handlePopoverOpen(dialog, toggleExpanded)
}

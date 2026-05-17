import type { RefObject } from 'react'

export function cancelDebounce(
  timeoutRef: RefObject<ReturnType<typeof setTimeout> | null>,
) {
  if (!timeoutRef.current) return

  clearTimeout(timeoutRef.current)
  timeoutRef.current = null
}

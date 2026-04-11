import { RefObject } from 'react'

type Params = {
  callback: VoidFunction
  duration: number
  timeoutRef: RefObject<NodeJS.Timeout | null>
}

export function debouncePopoverInteraction(params: Params) {
  if (params.timeoutRef.current) clearTimeout(params.timeoutRef.current)
  params.timeoutRef.current = setTimeout(params.callback, params.duration)
}

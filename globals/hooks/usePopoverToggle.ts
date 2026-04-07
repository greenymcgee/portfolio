'use client'

import { RefObject, useCallback } from 'react'

import { togglePopover as togglePopoverUtil } from '../utils'
import { useToggle } from './useToggle'

type Ref = RefObject<HTMLDialogElement | null>
type Options = ThirdParameterOf<typeof togglePopoverUtil>

export function usePopoverToggle(ref: Ref, options?: Options) {
  const [expanded, toggleExpanded] = useToggle()

  const togglePopover = useCallback(async () => {
    await togglePopoverUtil(ref.current, toggleExpanded, options)
  }, [options, ref, toggleExpanded])

  return { expanded, togglePopover }
}

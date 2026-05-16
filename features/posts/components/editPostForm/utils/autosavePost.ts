import { startTransition } from 'react'
import type { RefObject } from 'react'

type Params = {
  formRef: RefObject<HTMLFormElement | null>
  timeoutRef: RefObject<ReturnType<typeof setTimeout> | null>
  updateAction: (formData: FormData) => void
}

export function autosavePost({ formRef, timeoutRef, updateAction }: Params) {
  if (timeoutRef.current) {
    clearTimeout(timeoutRef.current)
    timeoutRef.current = null
  }

  timeoutRef.current = setTimeout(() => {
    if (!formRef.current) return

    startTransition(() => updateAction(new FormData(formRef.current!)))
  }, 1000)
}

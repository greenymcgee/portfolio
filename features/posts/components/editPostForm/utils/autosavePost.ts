import { startTransition } from 'react'
import type { RefObject } from 'react'

import { cancelDebounce } from './cancelDebounce'

type Params = {
  formRef: RefObject<HTMLFormElement | null>
  timeoutRef: RefObject<ReturnType<typeof setTimeout> | null>
  updateAction: (formData: FormData) => void
}

export function autosavePost({ formRef, timeoutRef, updateAction }: Params) {
  cancelDebounce(timeoutRef)
  timeoutRef.current = setTimeout(() => {
    if (!formRef.current) return

    startTransition(() => updateAction(new FormData(formRef.current!)))
  }, 1000)
}

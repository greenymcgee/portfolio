import { startTransition } from 'react'
import type { RefObject } from 'react'

import { cancelDebounce } from './cancelDebounce'

type Params = {
  formRef: RefObject<HTMLFormElement | null>
  timeoutRef: RefObject<ReturnType<typeof setTimeout> | null>
  updateAction: (formData: FormData) => void
}

export function debounceAutosave(params: Params) {
  cancelDebounce(params.timeoutRef)
  params.timeoutRef.current = setTimeout(() => {
    if (!params.formRef.current) return

    startTransition(() => {
      return params.updateAction(new FormData(params.formRef.current!))
    })
  }, 1000)
}

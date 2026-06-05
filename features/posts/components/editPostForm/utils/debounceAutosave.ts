import { startTransition } from 'react'
import type { RefObject } from 'react'

import { cancelDebounce } from './cancelDebounce'

type Params = {
  formRef: RefObject<HTMLFormElement | null>
  timeoutRef: RefObject<ReturnType<typeof setTimeout> | null>
  updateAction: (formData: FormData) => void
}

export function debounceAutosave(params: Params) {
  if (!params.formRef.current) return

  cancelDebounce(params.timeoutRef)
  params.timeoutRef.current = setTimeout(() => {
    startTransition(() => {
      return params.updateAction(new FormData(params.formRef.current!))
    })
  }, 1000)
  params.formRef.current.reportValidity()
}

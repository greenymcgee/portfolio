'use client'

import {
  PropsWithChildren,
  ReactElement,
  useCallback,
  useMemo,
  useState,
} from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { ROUTES } from '@/constants'
import { handleLoginFormSubmit } from '@/features/users/utils'

type Props = {
  ActionBar: ReactElement
}

export function LoginForm({ ActionBar, children }: PropsWithChildren<Props>) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  const errorCallback = useCallback((message: string) => setError(message), [])

  const successCallback = useCallback(() => {
    const redirect = searchParams.get('redirect')
    router.push(redirect ? redirect : ROUTES.home)
    router.refresh()
  }, [router, searchParams])

  const handleSubmit = useMemo(() => {
    return handleLoginFormSubmit({
      errorCallback,
      successCallback,
    })
  }, [errorCallback, successCallback])

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {children}
      {error ? (
        <p className="text-center text-sm text-red-500">{error}</p>
      ) : null}
      {ActionBar}
    </form>
  )
}

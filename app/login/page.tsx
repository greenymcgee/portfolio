'use client'

import { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { handleLoginFormSubmit } from '@/features/users/utils'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const errorCallback = useCallback((message: string) => setError(message), [])

  const successCallback = useCallback(() => {
    router.push('/')
    router.refresh()
  }, [router])

  const handleSubmit = useMemo(() => {
    return handleLoginFormSubmit({
      errorCallback,
      successCallback,
    })
  }, [errorCallback, successCallback])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="-space-y-px rounded-md shadow-xs">
            <div>
              <label className="sr-only" htmlFor="email">
                Email address
              </label>
              <input
                className="relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:ring-blue-500 focus:outline-hidden sm:text-sm"
                id="email"
                name="email"
                placeholder="Email address"
                required
                type="email"
              />
            </div>
            <div>
              <label className="sr-only" htmlFor="password">
                Password
              </label>
              <input
                className="relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:ring-blue-500 focus:outline-hidden sm:text-sm"
                id="password"
                name="password"
                placeholder="Password"
                required
                type="password"
              />
            </div>
          </div>

          {error ? (
            <div className="text-center text-sm text-red-500">{error}</div>
          ) : null}

          <div>
            <button
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-hidden"
              data-testid="submit-login-button"
              type="submit"
            >
              Sign in
            </button>
          </div>
        </form>
        <div className="text-center">
          <Link className="text-blue-600 hover:underline" href="/register">
            No account? Register.
          </Link>
        </div>
      </div>
    </div>
  )
}

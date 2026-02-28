import { Suspense } from 'react'

import { LoginForm } from '@/features/login/components'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <header className="mb-6">
          <h1 className="text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h1>
        </header>
        <Suspense>
          <LoginForm
            ActionBar={
              <button
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-hidden"
                data-testid="submit-login-button"
                type="submit"
              >
                Sign in
              </button>
            }
          >
            <fieldset className="-space-y-px rounded-md shadow-xs">
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
            </fieldset>
          </LoginForm>
        </Suspense>
      </div>
    </div>
  )
}

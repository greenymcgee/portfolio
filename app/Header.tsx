'use client'

import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'

export default function Header() {
  const { data: session } = useSession()

  return (
    <header className="w-full bg-white px-8 py-4 shadow-md">
      <nav className="flex items-center justify-between">
        <Link
          className="font-porter-sans-block text-xl font-bold text-gray-800 transition-colors hover:text-blue-600"
          href="/"
        >
          Coming soon
        </Link>
        <div className="flex items-center space-x-4">
          <Link
            className="rounded-lg bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600"
            href="/posts"
          >
            Posts
          </Link>
          {session ? (
            <>
              <Link
                className="rounded-lg bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600"
                href="/posts/new"
              >
                New Post
              </Link>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  {session.user?.firstName ? (
                    <div>{session.user.firstName}</div>
                  ) : null}
                  <div>{session.user?.email}</div>
                </div>
                <button
                  className="rounded-lg bg-red-500 px-4 py-2 text-white transition hover:bg-red-600"
                  onClick={() => signOut()}
                  type="button"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <Link
              className="rounded-lg bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600"
              href="/login"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}

'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface Post {
  id: number
  title: string
  content?: string
  createdAt: string
  author?: {
    name: string
  }
}

// Disable static generation
export const dynamic = 'force-dynamic'

function PostsList() {
  const searchParams = useSearchParams()
  const page = parseInt(searchParams.get('page') || '1')

  const [posts, setPosts] = useState<Post[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchPosts() {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/posts?page=${page}`)
        if (!res.ok) {
          throw new Error('Failed to fetch posts')
        }
        const data = await res.json()
        setPosts(data.posts)
        setTotalPages(data.totalPages)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching posts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [page])

  return (
    <>
      {isLoading ? (
        <div className="flex min-h-[200px] items-center justify-center space-x-2">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-gray-600">Loading...</p>
        </div>
      ) : (
        <>
          {posts.length === 0 ? (
            <p className="text-gray-600">No posts available.</p>
          ) : (
            <ul className="mx-auto w-full max-w-4xl space-y-6">
              {posts.map((post) => (
                <li
                  className="rounded-lg border bg-white p-6 shadow-md"
                  key={post.id}
                >
                  <Link
                    className="text-2xl font-semibold text-gray-900 hover:underline"
                    href={`/posts/${post.id}`}
                  >
                    {post.title}
                  </Link>
                  <p className="text-sm text-gray-500">
                    by {post.author?.name || 'Anonymous'}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </li>
              ))}
            </ul>
          )}

          {/* Pagination Controls */}
          <div className="mt-8 flex justify-center space-x-4">
            {page > 1 && (
              <Link href={`/posts?page=${page - 1}`}>
                <button
                  className="rounded-sm bg-gray-200 px-4 py-2 hover:bg-gray-300"
                  type="button"
                >
                  Previous
                </button>
              </Link>
            )}
            {page < totalPages && (
              <Link href={`/posts?page=${page + 1}`}>
                <button
                  className="rounded-sm bg-gray-200 px-4 py-2 hover:bg-gray-300"
                  type="button"
                >
                  Next
                </button>
              </Link>
            )}
          </div>
        </>
      )}
    </>
  )
}

// eslint-disable-next-line react/no-multi-comp
export default function PostsPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-gray-50 p-8">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            <p className="ml-3 text-gray-600">Loading page...</p>
          </div>
        }
      >
        <PostsList />
      </Suspense>
    </div>
  )
}

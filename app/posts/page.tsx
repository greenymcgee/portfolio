'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

import { User } from '@/prisma/generated/client'

// TODO: should not be recreating model types
interface Post {
  author: Pick<User, 'firstName'>
  content: string
  createdAt: string
  id: number
  title: string
}

// Disable static generation
export const dynamic = 'force-dynamic'

function PostsList() {
  const searchParams = useSearchParams()
  const page = parseInt(searchParams.get('page') || '0')

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
            <p>No posts available.</p>
          ) : (
            <ul className="mx-auto w-full max-w-4xl space-y-6">
              {posts.map((post) => (
                <li key={post.id}>
                  <Link
                    className="block rounded-lg border p-6 shadow-md"
                    href={`/posts/${post.id}`}
                  >
                    <p className="text-2xl font-semibold hover:underline">
                      {post.title}
                    </p>
                    <p className="text-sm">
                      by {post.author.firstName || 'Anonymous'}
                    </p>
                    <p className="text-xs">
                      {new Date(post.createdAt).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {/* Pagination Controls */}
          <div className="mt-8 flex justify-center space-x-4">
            {page > 0 && (
              <Link href={`/posts?page=${page - 1}`}>
                <button className="rounded-sm px-4 py-2" type="button">
                  Previous
                </button>
              </Link>
            )}
            {page < totalPages && (
              <Link href={`/posts?page=${page + 1}`}>
                <button className="rounded-sm px-4 py-2" type="button">
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
    <div className="flex min-h-screen flex-col items-center justify-start p-8">
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent" />
            <p className="ml-3">Loading page...</p>
          </div>
        }
      >
        <PostsList />
      </Suspense>
    </div>
  )
}

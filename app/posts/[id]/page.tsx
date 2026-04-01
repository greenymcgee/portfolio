export const dynamic = 'force-dynamic' // This disables SSG and ISR

import { tryCatch } from '@greenymcgee/typescript-utils'
import { headers } from 'next/headers'
import { notFound, redirect } from 'next/navigation'

import { fetchPost } from '@/features/posts/requests'
import { RichTextEditor } from '@/globals/components'
import { API_ROUTES } from '@/globals/constants'
import { baseAPI } from '@/lib/baseAPI'

type Props = {
  params: Promise<{ id: string }>
}

export default async function PostPage({ params }: Props) {
  const { id } = await params
  const postId = parseInt(id)
  const headersList = await headers()
  const cookie = headersList.get('cookie') ?? ''
  const { error, response } = await tryCatch(fetchPost(postId))

  if (error) return error.message

  const {
    data: { post },
  } = response
  if (!post) {
    notFound()
  }

  // Server action to delete the post
  async function deletePost() {
    'use server'

    await baseAPI.delete(API_ROUTES.post(postId), {
      headers: { Cookie: cookie },
    })
    redirect('/posts')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8">
      <article className="w-full max-w-3xl rounded-lg bg-white p-8 shadow-lg">
        <h1 className="mb-4 text-5xl font-extrabold text-gray-900">
          {post.title}
        </h1>

        <p className="mb-4 text-lg text-gray-600">
          by{' '}
          <span className="font-medium text-gray-800">
            {post.author.firstName || 'Anonymous'}
          </span>
        </p>

        <div className="space-y-6 border-t pt-6 text-lg leading-relaxed text-gray-800">
          {typeof post.content === 'string' ? (
            <RichTextEditor initialState={post.content} />
          ) : (
            <p className="text-gray-500 italic">
              No content available for this post.
            </p>
          )}
        </div>
      </article>

      <form action={deletePost} className="mt-6">
        <button
          className="rounded-lg bg-red-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-red-600"
          type="submit"
        >
          Delete Post
        </button>
      </form>
    </div>
  )
}

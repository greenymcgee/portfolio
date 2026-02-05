export const dynamic = 'force-dynamic' // This disables SSG and ISR

import { notFound, redirect } from 'next/navigation'

import prisma from '@/lib/prisma'

export default async function Post({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const postId = parseInt(id)

  const post = await prisma.post.findUnique({
    include: { author: true },
    where: { id: postId },
  })

  if (!post) {
    notFound()
  }

  // Server action to delete the post
  async function deletePost() {
    'use server'

    await prisma.post.delete({
      where: {
        id: postId,
      },
    })

    redirect('/posts')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8">
      <article className="w-full max-w-3xl rounded-lg bg-white p-8 shadow-lg">
        {/* Post Title */}
        <h1 className="mb-4 text-5xl font-extrabold text-gray-900">
          {post.title}
        </h1>

        {/* Author Information */}
        <p className="mb-4 text-lg text-gray-600">
          by{' '}
          <span className="font-medium text-gray-800">
            {post.author?.name || 'Anonymous'}
          </span>
        </p>

        {/* Content Section */}
        <div className="space-y-6 border-t pt-6 text-lg leading-relaxed text-gray-800">
          {post.content ? (
            <p>{post.content}</p>
          ) : (
            <p className="text-gray-500 italic">
              No content available for this post.
            </p>
          )}
        </div>
      </article>

      {/* Delete Button */}
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

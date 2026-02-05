export const dynamic = 'force-dynamic' // This disables SSG and ISR

import Link from 'next/link'
import { redirect } from 'next/navigation'

import { checkPostTableExists } from '@/lib/db-utils'
import prisma from '@/lib/prisma'

export default async function Home() {
  // Check if the post table exists
  const tableExists = await checkPostTableExists()

  // If the post table doesn't exist, redirect to setup page
  if (!tableExists) {
    redirect('/setup')
  }

  const posts = await prisma.post.findMany({
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 6,
  })

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-50 px-8 py-24">
      <h1 className="mb-12 text-5xl font-extrabold text-[#333333]">
        Recent Posts
      </h1>
      <div className="mb-8 grid w-full max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link className="group" href={`/posts/${post.id}`} key={post.id}>
            <div className="rounded-lg border bg-white p-6 shadow-md transition-shadow duration-300 hover:shadow-lg">
              <h2 className="mb-2 text-2xl font-semibold text-gray-900 group-hover:underline">
                {post.title}
              </h2>
              <p className="text-sm text-gray-500">
                by {post.author ? post.author.name : 'Anonymous'}
              </p>
              <p className="mb-4 text-xs text-gray-400">
                {new Date(post.createdAt).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
              <div className="relative">
                <p className="line-clamp-2 leading-relaxed text-gray-700">
                  {post.content || 'No content available.'}
                </p>
                <div className="absolute bottom-0 left-0 h-12 w-full bg-linear-to-t from-gray-50 to-transparent" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

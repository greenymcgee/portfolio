'use server'

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function createPost(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    throw new Error('You must be logged in to create a post')
  }

  await prisma.post.create({
    data: {
      authorId: session.user.id,
      content: formData.get('content') as string,
      title: formData.get('title') as string,
    },
  })

  redirect('/posts')
}

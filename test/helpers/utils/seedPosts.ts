import { prisma } from '@/lib/prisma'
import { PostCreateManyInput } from '@/prisma/generated/models'
import { POSTS } from '@/test/fixtures/posts'

export async function seedPosts(prismaClient = prisma) {
  await prismaClient.post.createMany({ data: POSTS as PostCreateManyInput[] })
}

import { prisma } from '@/lib/prisma'
import { User } from '@/prisma/generated/client'
import { PostCreateManyInput } from '@/prisma/generated/models'
import { ADMIN_USER } from '@/test/fixtures'
import { POSTS } from '@/test/fixtures/posts'

export async function seedPosts(prismaClient = prisma) {
  const author = (await prismaClient.user.findFirst({
    where: { email: ADMIN_USER.email },
  })) as User

  if (!author) throw new Error('⚠️ Users must be seeded before posts')

  await prismaClient.post.createMany({
    data: POSTS.map((post) => ({
      ...post,
      authorId: author.id,
      id: undefined,
    })) as PostCreateManyInput[],
  })
}

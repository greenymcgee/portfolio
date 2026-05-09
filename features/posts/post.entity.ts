import { prisma } from '@/lib/prisma'

export class PostEntity {
  public static count({ unpublished }: { unpublished: boolean }) {
    return prisma.post.count({ where: this.scopePublishedAt(unpublished) })
  }

  public static findMany(params: {
    limit: number
    offset: number
    unpublished: boolean
  }) {
    return prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      skip: params.offset,
      take: params.limit,
      where: this.scopePublishedAt(params.unpublished),
    })
  }

  private static scopePublishedAt(unpublished: boolean) {
    return { publishedAt: unpublished ? null : { lte: new Date() } }
  }
}

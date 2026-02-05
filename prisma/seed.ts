import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

import { PrismaClient } from './generated/client'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  // Create 5 users with hashed passwords
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice@example.com',
        name: 'Alice',
        password: await bcrypt.hash('password123', 10),
      },
    }),
    prisma.user.create({
      data: {
        email: 'bob@example.com',
        name: 'Bob',
        password: await bcrypt.hash('password123', 10),
      },
    }),
    prisma.user.create({
      data: {
        email: 'charlie@example.com',
        name: 'Charlie',
        password: await bcrypt.hash('password123', 10),
      },
    }),
    prisma.user.create({
      data: {
        email: 'diana@example.com',
        name: 'Diana',
        password: await bcrypt.hash('password123', 10),
      },
    }),
    prisma.user.create({
      data: {
        email: 'edward@example.com',
        name: 'Edward',
        password: await bcrypt.hash('password123', 10),
      },
    }),
  ])

  const userIdMapping = {
    alice: users[0].id,
    bob: users[1].id,
    charlie: users[2].id,
    diana: users[3].id,
    edward: users[4].id,
  }

  // Create 15 posts distributed among users
  await prisma.post.createMany({
    data: [
      // Alice's posts
      {
        authorId: userIdMapping.alice,
        content:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce id erat a lorem tincidunt ultricies. Vivamus porta bibendum nulla vel accumsan.',
        published: true,
        title: 'Getting Started with TypeScript and Prisma',
      },
      {
        authorId: userIdMapping.alice,
        content:
          'Duis sagittis urna ut sapien tristique convallis. Aenean vel ligula felis. Phasellus bibendum sem at elit dictum volutpat.',
        published: false,
        title: 'How ORMs Simplify Complex Queries',
      },

      // Bob's posts
      {
        authorId: userIdMapping.bob,
        content:
          'Ut ullamcorper nec erat id auctor. Nullam nec ligula in ex feugiat tincidunt. Cras accumsan vehicula tortor ut eleifend.',
        published: true,
        title: 'Mastering Prisma: Efficient Database Migrations',
      },
      {
        authorId: userIdMapping.bob,
        content:
          'Aliquam erat volutpat. Suspendisse potenti. Maecenas fringilla elit vel eros laoreet, et tempor sapien vulputate.',
        published: true,
        title: 'Best Practices for Type Safety in ORMs',
      },
      {
        authorId: userIdMapping.bob,
        content:
          'Donec ac magna facilisis, vestibulum ligula at, elementum nisl. Morbi volutpat eget velit eu egestas.',
        published: false,
        title: 'TypeScript Utility Types for Database Models',
      },

      // Charlie's posts (no posts for Charlie)

      // Diana's posts
      {
        authorId: userIdMapping.diana,
        content:
          'Vivamus ac velit tincidunt, sollicitudin erat quis, fringilla enim. Aenean posuere est a risus placerat suscipit.',
        published: true,
        title: 'Exploring Database Indexes and Their Performance Impact',
      },
      {
        authorId: userIdMapping.diana,
        content:
          'Sed vel suscipit lorem. Duis et arcu consequat, sagittis justo quis, pellentesque risus. Curabitur sed consequat est.',
        published: false,
        title: 'Choosing the Right Database for Your TypeScript Project',
      },
      {
        authorId: userIdMapping.diana,
        content:
          'Phasellus ut erat nec elit ultricies egestas. Vestibulum rhoncus urna eget magna varius pharetra.',
        published: true,
        title: 'Designing Scalable Schemas with Prisma',
      },
      {
        authorId: userIdMapping.diana,
        content:
          'Integer luctus ac augue at tristique. Curabitur varius nisl vitae mi fringilla, vel tincidunt nunc dictum.',
        published: false,
        title: 'Handling Relations Between Models in ORMs',
      },

      // Edward's posts
      {
        authorId: userIdMapping.edward,
        content:
          'Morbi non arcu nec velit cursus feugiat sit amet sit amet mi. Etiam porttitor ligula id sem molestie, in tempor arcu bibendum.',
        published: true,
        title: 'Why TypeORM Still Has Its Place in 2025',
      },
      {
        authorId: userIdMapping.edward,
        content:
          'Suspendisse a ligula sit amet risus ullamcorper tincidunt. Curabitur tincidunt, sapien id fringilla auctor, risus libero gravida odio, nec volutpat libero orci nec lorem.',
        published: true,
        title: 'NoSQL vs SQL: The Definitive Guide for Developers',
      },
      {
        authorId: userIdMapping.edward,
        content:
          'Proin vel diam vel nisi facilisis malesuada. Sed vitae diam nec magna mollis commodo a vitae nunc.',
        published: false,
        title: "Optimizing Queries with Prisma's Select and Include",
      },
      {
        authorId: userIdMapping.edward,
        content:
          'Nullam mollis quam sit amet lacus interdum, at suscipit libero pellentesque. Suspendisse in mi vitae magna finibus pretium.',
        published: true,
        title: 'PostgreSQL Optimizations Every Developer Should Know',
      },
      {
        authorId: userIdMapping.edward,
        content:
          'Cras vitae tortor in mauris tristique elementum non id ipsum. Nunc vitae pulvinar purus.',
        published: true,
        title: 'Scaling Applications with Partitioned Tables in PostgreSQL',
      },
    ],
  })

  // eslint-disable-next-line no-console
  console.log('Seeding completed.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

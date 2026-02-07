import { faker } from '@faker-js/faker'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

import { PrismaClient } from './generated/client'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  const bart = await prisma.user.create({
    data: {
      email: 'bart@test.com',
      firstName: 'Bart',
      lastName: 'Simpson',
      password: await bcrypt.hash('Testpass1!', 10),
      roles: ['ADMIN', 'USER'],
      username: 'eatmyshorts',
    },
  })
  await prisma.user.create({
    data: {
      email: 'ned@test.com',
      firstName: 'Ned',
      lastName: 'Flanders',
      password: await bcrypt.hash('Testpass1!', 10),
      username: 'theFlanMan',
    },
  })

  await prisma.post.createMany({
    data: Array.from(Array(15)).map((_, index) => {
      const date =
        index === 3
          ? null
          : index === 7
            ? null
            : index === 2
              ? faker.date.future()
              : faker.date.past()
      return {
        authorId: bart.id,
        content: {
          root: {
            children: [
              {
                children: [
                  {
                    detail: 0,
                    format: 0,
                    mode: 'normal',
                    style: '',
                    text: faker.lorem.paragraph(),
                    type: 'text',
                    version: 1,
                  },
                ],
                direction: 'ltr',
                format: '',
                indent: 0,
                textFormat: 0,
                textStyle: '',
                type: 'paragraph',
                version: 1,
              },
            ],
            direction: 'ltr',
            format: '',
            indent: 0,
            type: 'root',
            version: 1,
          },
        },
        publishedAt: date,
        title: faker.book.title(),
      }
    }),
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

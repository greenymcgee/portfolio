import { PrismaPg } from '@prisma/adapter-pg'

import { seedPosts, seedUsers } from '@/test/helpers/utils'

import { PrismaClient } from './generated/client'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  await seedUsers(prisma)
  await seedPosts(prisma)

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

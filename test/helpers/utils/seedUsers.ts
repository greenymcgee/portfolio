import bcrypt from 'bcryptjs'

import { prisma } from '@/lib/prisma'
import { ADMIN_USER, BASIC_USER } from '@/test/fixtures'

export async function seedUsers(prismaClient = prisma) {
  await prismaClient.user.createMany({
    data: [
      {
        ...ADMIN_USER,
        password: await bcrypt.hash(ADMIN_USER.password, 10),
      },
      {
        ...BASIC_USER,
        password: await bcrypt.hash(BASIC_USER.password, 10),
      },
    ],
  })
}

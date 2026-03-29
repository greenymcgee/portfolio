import { PrismaClient } from '@prisma/client/extension'
import { DeepMockProxy, mockDeep, mockReset } from 'vitest-mock-extended'

import { prisma } from '@/lib/prisma'

vi.mock('@/lib/prisma/client', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}))

beforeEach(() => {
  mockReset(prismaMock)
})

export const prismaMock = prisma as unknown as DeepMockProxy<typeof prisma>

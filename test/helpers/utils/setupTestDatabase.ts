import { prisma } from '@/lib/prisma'

import { seedPosts } from './seedPosts'
import { seedUsers } from './seedUsers'

interface Options {
  /**
   * Defaults to false, and tests are much faster when this is false. Only set
   * to true if you need to tear down data created in tests.
   */
  mutatesData?: boolean
  /**
   * Seeds posts data in the db using test/helpers/utils/seedPosts.ts.
   */
  withPosts?: boolean
  /**
   * Seeds users data in the db using test/helpers/utils/seedUsers.ts.
   */
  withUsers?: boolean
}

function getSetup(mutates: boolean) {
  if (mutates) return beforeEach

  return beforeAll
}

function getTeardown(mutates: boolean) {
  if (mutates) return afterEach

  return afterAll
}

/**
 * Sets up your test database with whatever data you need to be available for
 * your tests, and tears the data back down after the tests run based on the
 * `mutatesData` option. See the Options type and its descriptions for more
 * info.
 *
 * @example
 * setupTestDatabase({ withPosts: true, withUsers: true })
 * @param {Options} options
 */
export function setupTestDatabase(options?: Options) {
  const {
    mutatesData = false,
    withPosts = false,
    withUsers = false,
  }: Options = { ...options }
  const setup = getSetup(mutatesData)
  const teardown = getTeardown(mutatesData)

  setup(async () => {
    if (withPosts && !withUsers) throw new Error('Posts require User seeds')
    if (withUsers) await seedUsers()
    if (withPosts) await seedPosts()
  })

  teardown(async () => {
    await prisma.post.deleteMany()
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.$disconnect()
  })
}

import type { SummonError } from '@greenymcgee/summon'

import type { FindAndCountPostsResponse } from './findAndCountPostsResponse'

export type PaginatedPostsQuery = Promise<
  | {
      data: FindAndCountPostsResponse
      error: null
    }
  | {
      data: null
      error: SummonError<{
        message: string
        type: string
      }>
    }
>

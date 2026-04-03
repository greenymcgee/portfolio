'use client'

import { useMemo } from 'react'
import type { SummonError } from '@greenymcgee/summon'
import { useSearchParams } from 'next/navigation'

import { API_ROUTES } from '@/globals/constants'
import { baseAPI } from '@/lib/baseAPI'

import type { FindAndCountPostsResponse } from '../types'

export function useGetPaginatedPostsQuery() {
  const searchParams = useSearchParams()
  const page = Number(searchParams.get('page') || '0')
  return useMemo(
    () =>
      baseAPI
        .get<FindAndCountPostsResponse>(`${API_ROUTES.posts}?page=${page}`)
        .then(({ data }) => ({ data, error: null }))
        .catch((error) => ({
          data: null,
          error: error as SummonError<{ message: string; type: string }>,
        })),
    [page],
  )
}

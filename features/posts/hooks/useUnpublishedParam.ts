'use client'

import { useSearchParams } from 'next/navigation'

export function useUnpublishedParam() {
  const searchParams = useSearchParams()
  return searchParams.get('unpublished') === 'true'
}

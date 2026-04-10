'use client'

import { ProviderTree } from '@/providers'

export function TestProviders(props: PropsOf<typeof ProviderTree>) {
  return <ProviderTree {...props} />
}

import { SessionProvider } from 'next-auth/react'

type Props = PropsOf<typeof SessionProvider> & {
  includesSession: boolean
}

export function MockSessionProvider({ includesSession, ...props }: Props) {
  if (includesSession) return <SessionProvider {...props} />

  return <>{props.children}</>
}

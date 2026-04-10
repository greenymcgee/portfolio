import { SessionContextValue } from 'next-auth/react'

type Props = { status: SessionContextValue['status'] }

export function SessionStatus({ status }: Props) {
  if (process.env.NODE_ENV !== 'test') return null

  return <>{status}</>
}

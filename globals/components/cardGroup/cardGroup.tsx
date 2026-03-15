import { HTMLAttributes } from 'react'
import clsx from 'clsx'

interface Props extends HTMLAttributes<HTMLUListElement> {
  classNameOverrides?: { display?: string; gap?: string }
}

export function CardGroup({
  children,
  className,
  classNameOverrides,
  ...options
}: Props) {
  return (
    <ul
      className={clsx('group', className, {
        'flex flex-col': !classNameOverrides?.display,
        'gap-8': !classNameOverrides?.gap,
      })}
      {...options}
    >
      {children}
    </ul>
  )
}

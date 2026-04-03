import { HTMLAttributes } from 'react'
import clsx from 'clsx'

interface Props extends HTMLAttributes<HTMLDivElement> {
  classNameOverrides?: { display?: string; gap?: string }
}

export function CardGroup({
  children,
  className,
  classNameOverrides,
  ...options
}: Props) {
  return (
    <div
      className={clsx('group', className, {
        'flex flex-col': !classNameOverrides?.display,
        'gap-8': !classNameOverrides?.gap,
      })}
      {...options}
    >
      {children}
    </div>
  )
}

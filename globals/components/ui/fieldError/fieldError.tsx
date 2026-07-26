import { type ComponentProps, useMemo } from 'react'

import { cn } from '@/lib/utils'

type Props = ComponentProps<'div'> & {
  errors?: string[] | undefined
}

export function FieldError({
  className,
  children,
  errors = [],
  ...props
}: Props) {
  const content = useMemo(() => {
    if (children) return children

    if (!errors.length) return null

    if (errors.length === 1) return errors.toString()

    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {errors.map((error) => (
          <li key={error}>{error}</li>
        ))}
      </ul>
    )
  }, [children, errors])

  if (content == null) return null

  return (
    <div
      className={cn('text-destructive text-sm font-normal', className)}
      data-slot="field-error"
      role="alert"
      {...props}
    >
      {content}
    </div>
  )
}

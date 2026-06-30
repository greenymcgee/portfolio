import { type ComponentProps } from 'react'

import { cn } from '@/lib/utils'

import { Label } from '../label'

type LabelProps = ComponentProps<typeof Label>
type Props = Omit<LabelProps, 'htmlFor'> & { htmlFor: LabelProps['htmlFor'] }

export function FieldLabel({ className, htmlFor, ...props }: Props) {
  return (
    <Label
      className={cn(
        'group/field-label peer/field-label has-data-checked:border-primary/30',
        'has-data-checked:bg-primary/5 dark:has-data-checked:border-primary/20',
        'dark:has-data-checked:bg-primary/10 flex w-fit gap-2 leading-snug',
        'group-data-[disabled=true]/field:opacity-50 has-[>[data-slot=field]]:rounded-md',
        'has-[>[data-slot=field]]:border *:data-[slot=field]:p-3',
        'has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col',
        className,
      )}
      data-slot="field-label"
      htmlFor={htmlFor}
      {...props}
    />
  )
}

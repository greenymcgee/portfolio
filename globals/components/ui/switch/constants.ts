import { cva } from 'class-variance-authority'

export const SWITCH_TRACK_VARIANTS = cva(
  [
    'peer',
    'group/switch',
    'focus-visible:border-ring',
    'focus-visible:ring-ring/50',
    'aria-invalid:border-destructive',
    'aria-invalid:ring-destructive/20',
    'dark:aria-invalid:border-destructive/50',
    'dark:aria-invalid:ring-destructive/40',
    'relative',
    'inline-flex',
    'shrink-0',
    'items-center',
    'rounded-full',
    'border',
    'border-transparent',
    'shadow-xs',
    'transition-all',
    'outline-none',
    'after:absolute',
    'after:-inset-x-3',
    'after:-inset-y-2',
    'focus-visible:ring-3',
    'aria-invalid:ring-3',
    'data-disabled:cursor-not-allowed',
    'data-disabled:opacity-50',
    'data-[size=default]:h-[18.4px]',
    'data-[size=default]:w-[32px]',
    'data-[size=sm]:h-[14px]',
    'data-[size=sm]:w-[24px]',
  ],
  {
    defaultVariants: {
      variant: 'default',
    },
    variants: {
      variant: {
        default: 'bg-subtle data-checked:bg-background',
        inverted: 'bg-subtle data-checked:bg-input',
        primary:
          'data-checked:bg-primary data-unchecked:bg-input dark:data-unchecked:bg-input/80',
      },
    },
  },
)

export const SWITCH_THUMB_VARIANTS = cva(
  [
    'pointer-events-none',
    'block',
    'rounded-full',
    'ring-0',
    'transition-transform',
    'group-data-[size=default]/switch:size-4',
    'group-data-[size=sm]/switch:size-3',
    'group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)]',
    'group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)]',
    'group-data-[size=default]/switch:data-unchecked:translate-x-0',
    'group-data-[size=sm]/switch:data-unchecked:translate-x-0',
  ],
  {
    defaultVariants: {
      variant: 'default',
    },
    variants: {
      variant: {
        default: 'data-unchecked:bg-background/70 data-checked:bg-input',
        inverted: 'data-unchecked:bg-input/80 data-checked:bg-background',
        primary:
          'bg-background dark:data-checked:bg-primary-foreground dark:data-unchecked:bg-foreground',
      },
    },
  },
)

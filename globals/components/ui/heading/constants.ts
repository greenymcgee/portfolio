import { cva } from 'class-variance-authority'

export const HEADING_VARIANTS = cva(['font-porter-sans-block', 'leading-md'], {
  defaultVariants: { size: '4xl' },
  variants: {
    size: {
      '2xl': ['text-xl', 'md:text-2xl'],
      '4xl': ['text-xl', 'sm:text-2xl', 'md:text-3xl', 'lg:text-4xl'],
    },
  },
})

import { cva } from 'class-variance-authority'

export const HEADING_VARIANTS = cva(['font-porter-sans-block', 'leading-md'], {
  defaultVariants: { level: 'h1' },
  variants: {
    level: {
      h1: ['text-xl', 'sm:text-2xl', 'md:text-3xl', 'lg:text-4xl'],
      h2: ['text-xl', 'md:text-2xl'],
    },
  },
})

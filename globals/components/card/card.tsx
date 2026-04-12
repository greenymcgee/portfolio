import { ElementType, PropsWithChildren, ReactElement } from 'react'
import clsx from 'clsx'
import { SquareArrowOutUpRight } from 'lucide-react'
import Link from 'next/link'

type Props = {
  as?: Exclude<ElementType, 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h5'>
  description: string
  external?: boolean
  id: string
  link: string
  subtitle?: string
  title: ReactElement | string
}

export function Card({
  as: As = 'article',
  children,
  description,
  external = false,
  id,
  link,
  subtitle,
  title,
}: PropsWithChildren<Props>) {
  return (
    <As
      className={clsx(
        'relative rounded-md pr-6',
        'group transition-[color,opacity,padding]',
        'hover:bg-muted hover:border hover:p-3',
        'focus-within:bg-muted focus-within:border focus-within:p-3',
        'active:bg-muted active:border active:p-3',
        'group-hover:opacity-50 hover:opacity-100!',
        'group-focus-within:opacity-50 focus-within:opacity-100!',
      )}
      data-testid={`card-${id}`}
      id={id}
    >
      <div className="mb-2 flex items-center justify-between gap-1">
        <header className="w-full">
          <div className="flex items-center justify-between gap-1">
            <Link
              className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-0"
              href={link}
              rel={external ? 'noopener noreferrer' : undefined}
              target={external ? '_blank' : undefined}
            >
              <h3 className="text-primary flex items-center gap-2 font-semibold">
                {title}
              </h3>
            </Link>
            {external ? (
              <SquareArrowOutUpRight
                aria-hidden
                className={clsx(
                  'text-primary inline h-[1em] w-[1em] text-lg',
                  'transition-[font-size] group-hover:text-[1.25rem]',
                )}
              />
            ) : null}
          </div>
          {subtitle ? <p className="pt-2 text-sm">{subtitle}</p> : null}
        </header>
      </div>
      <p className="text-subtle mb-6">{description}</p>
      {children}
    </As>
  )
}

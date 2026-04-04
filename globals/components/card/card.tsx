import { ElementType } from 'react'
import clsx from 'clsx'
import { SquareArrowOutUpRight } from 'lucide-react'
import Link from 'next/link'

type Props = {
  as?: ElementType
  description: string
  endDate?: string
  id: string
  link: string
  name: string
  startDate?: string
  title?: string
  tools: SoftwareTool[]
}

export function Card({
  as: As = 'article',
  description,
  endDate,
  id,
  link,
  name,
  startDate,
  title,
  tools,
}: Props) {
  return (
    <As
      className={clsx(
        'relative rounded-md pr-6',
        'group transition-[color,opacity,padding]',
        'hover:bg-app-surface-alt hover:border hover:p-3',
        'focus-within:bg-app-surface-alt focus-within:border focus-within:p-3',
        'active:bg-app-surface-alt active:border active:p-3',
        'group-hover:opacity-50 hover:opacity-100!',
        'group-focus-within:opacity-50 focus-within:opacity-100!',
      )}
      data-testid={`card-${id}`}
      id={id}
    >
      <div className="mb-2 flex items-center justify-between gap-1">
        <header className="w-full">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-2">
              <Link
                className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-0"
                href={link}
                rel="noopener noreferrer"
                target="_blank"
              >
                <h3 className="text-primary font-semibold">{name}</h3>
              </Link>
              {startDate ? (
                <p className="text-subtle flex items-center text-sm">
                  {startDate}
                  {endDate ? (
                    <>
                      <span
                        aria-label="to"
                        className="border-subtle mx-1 w-3 border-b"
                      />
                      {endDate}
                    </>
                  ) : null}
                </p>
              ) : null}
            </div>
            <SquareArrowOutUpRight
              aria-hidden
              className={clsx(
                'text-primary inline h-[1em] w-[1em] text-lg',
                'transition-[font-size] group-hover:text-[1.25rem]',
              )}
            />
          </div>
          {title ? <p className="pt-2 text-sm">{title}</p> : null}
        </header>
      </div>
      <p className="text-subtle mb-6">{description}</p>
      <ul className="grid grid-cols-2 grid-rows-2 gap-2 sm:flex">
        {tools.map((tool) => (
          <li
            className="bg-primary/10 text-primary rounded-full border px-2 py-1 text-sm"
            key={tool}
          >
            {tool}
          </li>
        ))}
      </ul>
    </As>
  )
}

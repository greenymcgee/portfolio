'use client'

import {
  FocusEvent,
  MouseEvent,
  TouchEvent,
  useCallback,
  useState,
} from 'react'
import clsx from 'clsx'
import { SquareArrowOutUpRight } from 'lucide-react'
import Link from 'next/link'

import { PROJECTS } from '@/globals/constants'

type UserInteractionEvent =
  | FocusEvent<HTMLLIElement>
  | TouchEvent<HTMLLIElement>
  | MouseEvent<HTMLLIElement>

export function Projects() {
  const [activeProjectKey, setActiveProjectKey] = useState('')

  const handleUserInteraction = useCallback((event: UserInteractionEvent) => {
    setActiveProjectKey(event.currentTarget.dataset.key as string)
  }, [])

  const resetActiveProjectKey = useCallback(() => setActiveProjectKey(''), [])

  return (
    <ul className="flex flex-col gap-8">
      {PROJECTS.map((project) => (
        <li
          className={clsx(
            'rounded-md pr-6',
            'group transition-[color,padding]',
            'hover:bg-app-surface-alt hover:border hover:p-3',
            'focus-within:bg-app-surface-alt focus-within:border focus-within:p-3',
            'active:bg-app-surface-alt active:border active:p-3',
            {
              'opacity-50':
                activeProjectKey && project.key !== activeProjectKey,
            },
          )}
          data-key={project.key}
          key={project.key}
          onBlur={resetActiveProjectKey}
          onFocus={handleUserInteraction}
          onMouseLeave={resetActiveProjectKey}
          onMouseOver={handleUserInteraction}
          onTouchCancel={resetActiveProjectKey}
          onTouchEnd={resetActiveProjectKey}
          onTouchStart={handleUserInteraction}
        >
          <Link
            className="focus-visible:outline-0"
            href={project.link}
            rel="noopener noreferrer"
            target="_blank"
          >
            <h3 className="text-primary mb-2 flex items-center justify-between gap-1 font-semibold">
              {project.title}{' '}
              <SquareArrowOutUpRight
                className={clsx(
                  'inline h-[1em] w-[1em] text-lg',
                  'transition-[font-size] group-hover:text-[1.25rem]',
                )}
              />
            </h3>
            <p className="text-subtle mb-6">{project.description}</p>
            <ul className="grid grid-cols-2 grid-rows-2 gap-2 sm:flex">
              {project.tools.map((tool) => (
                <li
                  className="bg-primary/10 text-primary rounded-full border px-2 py-1 text-sm"
                  key={tool}
                >
                  {tool}
                </li>
              ))}
            </ul>
          </Link>
        </li>
      ))}
    </ul>
  )
}

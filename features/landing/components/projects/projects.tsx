'use client'

import { useCallback, useState } from 'react'

import { Card } from '@/globals/components'
import { PROJECTS } from '@/globals/constants'

type OnUserInteraction = PropsOf<typeof Card>['onUserInteraction']

export function Projects() {
  const [activeId, setActiveId] = useState('')

  const handleUserInteraction = useCallback<OnUserInteraction>((event) => {
    setActiveId(event.currentTarget.id)
  }, [])

  const resetActiveId = useCallback(() => setActiveId(''), [])

  return (
    <ul className="flex flex-col gap-8" data-testid="projects">
      {PROJECTS.map((project) => (
        <Card
          activeId={activeId}
          description={project.description}
          id={project.id}
          key={project.id}
          link={project.link}
          name={project.name}
          onUserInteraction={handleUserInteraction}
          resetActiveId={resetActiveId}
          tools={project.tools}
        />
      ))}
    </ul>
  )
}

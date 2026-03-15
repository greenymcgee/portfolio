'use client'

import { useCallback, useState } from 'react'

import { Card } from '@/globals/components'
import { EXPERIENCES } from '@/globals/constants'

type OnUserInteraction = PropsOf<typeof Card>['onUserInteraction']

export function Experience() {
  const [activeId, setActiveId] = useState('')

  const handleUserInteraction = useCallback<OnUserInteraction>((event) => {
    setActiveId(event.currentTarget.id)
  }, [])

  const resetActiveId = useCallback(() => setActiveId(''), [])

  return (
    <ul className="flex flex-col gap-8" data-testid="experiences">
      {EXPERIENCES.map((experience) => (
        <Card
          activeId={activeId}
          description={experience.description}
          endDate={experience.endDate}
          id={experience.id}
          key={experience.id}
          link={experience.link}
          name={experience.name}
          onUserInteraction={handleUserInteraction}
          resetActiveId={resetActiveId}
          startDate={experience.startDate}
          title={experience.title}
          tools={experience.tools}
        />
      ))}
    </ul>
  )
}

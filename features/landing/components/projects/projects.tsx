import { Card, CardGroup } from '@/globals/components'
import { PROJECTS } from '@/globals/constants'

import { Tools } from '../tools'

export function Projects() {
  return (
    <CardGroup data-testid="projects">
      {PROJECTS.map((project) => (
        <Card
          description={project.description}
          external={project.id !== 'round-the-corner'}
          id={project.id}
          key={project.id}
          link={project.link}
          title={project.name}
        >
          <Tools tools={project.tools} />
        </Card>
      ))}
    </CardGroup>
  )
}

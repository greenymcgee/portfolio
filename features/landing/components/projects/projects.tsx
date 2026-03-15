import { Card, CardGroup } from '@/globals/components'
import { PROJECTS } from '@/globals/constants'

export function Projects() {
  return (
    <CardGroup data-testid="projects">
      {PROJECTS.map((project) => (
        <Card
          description={project.description}
          id={project.id}
          key={project.id}
          link={project.link}
          name={project.name}
          tools={project.tools}
        />
      ))}
    </CardGroup>
  )
}

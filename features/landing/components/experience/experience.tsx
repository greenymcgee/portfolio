import { Card, CardGroup } from '@/globals/components'
import { EXPERIENCES } from '@/globals/constants'

export function Experience() {
  return (
    <CardGroup data-testid="experiences">
      {EXPERIENCES.map((experience) => (
        <Card
          description={experience.description}
          endDate={experience.endDate}
          id={experience.id}
          key={experience.id}
          link={experience.link}
          name={experience.name}
          startDate={experience.startDate}
          title={experience.title}
          tools={experience.tools}
        />
      ))}
    </CardGroup>
  )
}

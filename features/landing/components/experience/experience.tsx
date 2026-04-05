import { Card, CardGroup } from '@/globals/components'
import { EXPERIENCES } from '@/globals/constants'

import { Tools } from '../tools'

export function Experience() {
  return (
    <CardGroup data-testid="experiences">
      {EXPERIENCES.map((experience) => (
        <Card
          description={experience.description}
          external
          id={experience.id}
          key={experience.id}
          link={experience.link}
          subtitle={experience.title}
          title={
            <>
              {experience.name}{' '}
              <span className="text-subtle flex items-center text-sm">
                {experience.startDate}
                {experience.endDate ? (
                  <>
                    <span
                      aria-label="to"
                      className="border-subtle mx-1 w-3 border-b"
                    />
                    {experience.endDate}
                  </>
                ) : null}
              </span>
            </>
          }
        >
          <Tools tools={experience.tools} />
        </Card>
      ))}
    </CardGroup>
  )
}

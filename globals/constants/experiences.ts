type Experience = {
  description: string
  endDate: string
  id: string
  link: string
  name: string
  startDate: string
  title: string
  tools: SoftwareTool[]
}

export const EXPERIENCES = [
  {
    description:
      'I lead teams that build and maintain features for an event management SasS platform. I work closely with product and design teams to build consistent experiences for users from many different hotels and restaurants.',
    endDate: 'Present',
    id: 'tripleseat',
    link: 'https://tripleseat.com',
    name: 'Tripleseat',
    startDate: '2023',
    title: 'Senior Software Engineer - Hospitality',
    tools: ['React', 'TypeScript', 'jQuery', 'Rails'],
  } satisfies Experience,
  {
    description:
      'Maintained and built new features for their customer portal. Led a transition from a Webpack based React application to a Next.js based application successfully while maintaining 99% test coverage.',
    endDate: '2023',
    id: 'above-lending',
    link: 'https://abovelending.com',
    name: 'Above Lending',
    startDate: '2022',
    title: 'Senior Software Engineer - Fintech',
    tools: ['Next.js', 'TypeScript', 'Chakra UI', 'Rails'],
  } satisfies Experience,
  {
    description:
      'Built and maintained features for programs aimed at assisting workers and families in need. Features often involved collecting data and creating content management software to interact with the data.',
    endDate: '2022',
    id: 'public-strategies',
    link: 'https://www.publicstrategies.com',
    name: 'Public Strategies',
    startDate: '2018',
    title: 'Web Developer - Public Sector',
    tools: ['Next.js', 'TypeScript', 'TailwindCSS', 'Rails'],
  } satisfies Experience,
  {
    description:
      'Learned by building graph based apps until I was ready to contribute sprint work. Built several core components of the Lifegroups Search feature, and contributed to a video chat project.',
    endDate: '',
    id: 'life-church',
    link: 'https://www.life.church',
    name: 'Life.Church',
    startDate: '2018',
    title: 'Software Engineer LXP Intern',
    tools: ['React', 'Flow-Typed', 'Rails'],
  } satisfies Experience,
] as const

import { ROUTES } from './routes'

type Project = {
  description: string
  key: string
  link: string
  title: string
  tools: SoftwareTool[]
}

export const PROJECTS = [
  {
    description:
      "A video game review site powered by the IGDB API. It's mostly a space for me to collect data about all the games I've played in my lifetime, and write about my memories with each one.",
    key: 'the-verdant-veil',
    link: 'https://theverdantveil.com',
    title: 'The Verdant Veil',
    tools: ['Next.js', 'TypeScript', 'TailwindCSS', 'Rails'],
  } satisfies Project,
  {
    description:
      "The other half of this site where I write about topics from software engineering to music and what I'm up to lately with songwriting.",
    key: 'round-the-corner',
    link: ROUTES.posts,
    title: "'round the Corner",
    tools: ['Next.js', 'TypeScript', 'TailwindCSS', 'Prisma'],
  } satisfies Project,
] as const

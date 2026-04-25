import Link from 'next/link'

import { EXTERNAL_LINKS } from '@/globals/constants'

import { GitHub, LinkedIn } from '../svgs'

export function Socials() {
  return (
    <div data-testid="socials">
      <Link
        aria-label="GitHub profile"
        className="mr-4"
        href={EXTERNAL_LINKS.githubProfile}
        rel="noopener noreferrer"
        target="_blank"
      >
        <GitHub className="inline" />
      </Link>
      <Link
        aria-label="LinkedIn profile"
        href={EXTERNAL_LINKS.linkedInProfile}
        rel="noopener noreferrer"
        target="_blank"
      >
        <LinkedIn className="inline" />
      </Link>
    </div>
  )
}

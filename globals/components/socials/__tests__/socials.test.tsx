import { render, screen } from '@testing-library/react'

import { EXTERNAL_LINKS } from '@/globals/constants'

import { Socials } from '..'

describe('<Socials />', () => {
  it.each([
    { href: EXTERNAL_LINKS.githubProfile, label: 'GitHub profile' },
    { href: EXTERNAL_LINKS.linkedInProfile, label: 'LinkedIn profile' },
  ])('should render a link to the profile', ({ href, label }) => {
    render(<Socials />)
    expect(screen.getByLabelText(label)).toHaveAttribute('href', href)
  })

  it.each([
    { label: 'GitHub profile' },
    { label: 'LinkedIn profile' },
  ])('should open the profile in a new tab with noopener', ({ label }) => {
    render(<Socials />)
    const link = screen.getByLabelText(label)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })
})

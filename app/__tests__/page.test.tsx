import { render, screen } from '@testing-library/react'

import { EXTERNAL_LINKS } from '@/globals/constants'

import HomePage from '../page'

describe('<HomePage />', () => {
  it('should render an h1', () => {
    render(<HomePage />)
    expect(screen.getByTestId('home-page-heading').tagName).toBe('H1')
  })

  it('should render the Experience section', () => {
    render(<HomePage />)
    expect(screen.getByText('Experience')).toBeVisible()
    expect(screen.getByTestId('experiences')).toBeVisible()
  })

  it('should render the Projects section', () => {
    render(<HomePage />)
    expect(screen.getByText('Projects')).toBeVisible()
    expect(screen.getByTestId('projects')).toBeVisible()
  })

  it.each([
    { label: 'GitHub profile', link: EXTERNAL_LINKS.githubProfile },
    { label: 'LinkedIn profile', link: EXTERNAL_LINKS.linkedInProfile },
  ])('should render the footer', ({ label, link }) => {
    render(<HomePage />)
    expect(screen.getByLabelText(label)).toHaveAttribute('href', link)
  })
})

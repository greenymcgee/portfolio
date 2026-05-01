import { render, screen } from '@testing-library/react'

import { ROUTES } from '@/globals/constants'
import { authoredPostFactory } from '@/test/factories'

import { PostCards } from '..'

const PROPS: PropsOf<typeof PostCards> = {
  posts: authoredPostFactory.buildList(2),
}

describe('<PostCards />', () => {
  it('should render the empty message when there are no posts', () => {
    render(<PostCards posts={[]} />)
    expect(screen.getByTestId('latest-posts-empty')).toBeVisible()
  })

  it.each(PROPS.posts)(
    'should render a link for each post with the correct destination',
    ({ id, title }) => {
      render(<PostCards {...PROPS} />)
      expect(screen.getByRole('link', { name: title })).toHaveAttribute(
        'href',
        ROUTES.post(id),
      )
    },
  )
})

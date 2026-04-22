import { faker } from '@faker-js/faker'
import {
  fireEvent,
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EditorState } from 'lexical'
import mockRouter from 'next-router-mock'

import { RichTextEditor } from '@/globals/components'
import { INTERNAL_SERVER_ERROR, ROUTES } from '@/globals/constants'
import { LEXICAL_EDITOR_JSON, UNPUBLISHED_POST } from '@/test/fixtures'
import { mockCookieHeader, renderWithProviders } from '@/test/helpers/utils'
import {
  mockPostsAuthSession,
  mockPostsCreateResponse,
  postsServer,
} from '@/test/servers'

import { CreatePostForm } from '..'

beforeAll(() => postsServer.listen())
beforeEach(() => {
  mockRouter.push(ROUTES.newPost)
  postsServer.resetHandlers()
})
afterAll(() => postsServer.close())

vi.mock('@/globals/components', async (importActual) => {
  const barrel = await importActual<typeof import('@/globals/components')>()
  const React = await import('react')
  const json = JSON.parse(LEXICAL_EDITOR_JSON)
  return {
    ...barrel,
    RichTextEditor: function RichTextEditorMock({
      onChange,
      editing,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      initialState,
      ...rest
    }: PropsOf<typeof RichTextEditor>) {
      React.useEffect(() => {
        if (!editing || !onChange) return

        onChange({ toJSON: () => json } as unknown as EditorState)
      }, [editing, onChange])

      return (
        <div data-testid="content-editor" {...rest}>
          <div role="textbox" tabIndex={0} />
        </div>
      )
    },
  }
})

describe('<CreatePostForm />', () => {
  it('should redirect an unauthorized user', async () => {
    mockPostsAuthSession({ role: 'USER' })
    renderWithProviders(<CreatePostForm />, { includesSession: true })
    await waitFor(() => expect(mockRouter.pathname).toBe(ROUTES.home))
  })

  it('should render an error message when the POST request errors', async () => {
    await mockCookieHeader()
    mockPostsCreateResponse({ status: INTERNAL_SERVER_ERROR })
    renderWithProviders(<CreatePostForm />, { includesSession: true })
    await userEvent.type(screen.getByLabelText(/Title/), 'title')
    const editor = screen
      .getByTestId('content-editor')
      .querySelector('[role="textbox"]') as Element
    await userEvent.type(editor, 'content')
    const submitButton = screen.getByTestId('submit-post-button')
    fireEvent.click(submitButton)
    await waitForElementToBeRemoved(screen.getByRole('status'))
    expect(screen.getByTestId('error-message')).toBeVisible()
  })

  it('should render a form that calls the createPost action', async () => {
    await mockCookieHeader()
    renderWithProviders(<CreatePostForm />, { includesSession: true })
    await userEvent.type(screen.getByLabelText(/Title/), faker.book.title())
    await userEvent.type(
      screen.getByLabelText(/Description/),
      faker.lorem.word(),
    )
    const editor = screen
      .getByTestId('content-editor')
      .querySelector('[role="textbox"]') as Element
    await userEvent.type(editor, 'content')
    const submitButton = screen.getByTestId('submit-post-button')
    fireEvent.click(submitButton)
    await waitForElementToBeRemoved(screen.getByRole('status'))
    expect(mockRouter.pathname).toBe(ROUTES.post(UNPUBLISHED_POST.id))
  })
})

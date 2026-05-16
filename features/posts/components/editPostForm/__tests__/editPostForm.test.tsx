import { act, fireEvent, screen } from '@testing-library/react'
import { EditorState } from 'lexical'

import { PostRepository } from '@/features/posts/post.repository'
import { LegacyRichTextEditor } from '@/globals/components'
import {
  AUTHORED_POST,
  LEXICAL_EDITOR_JSON,
  UNPUBLISHED_POST,
} from '@/test/fixtures'
import { mockServerSession, renderWithProviders } from '@/test/helpers/utils'
import { rootLayoutServer } from '@/test/servers'

import { EditPostForm } from '..'

vi.mock('@/globals/components', async (importActual) => {
  const barrel = await importActual<typeof import('@/globals/components')>()
  const { LEXICAL_EDITOR_JSON: editorJson } = await import('@/test/fixtures')
  return {
    ...barrel,
    LegacyRichTextEditor: function LegacyRichTextEditorMock({
      onChange,
    }: PropsOf<typeof LegacyRichTextEditor>) {
      return (
        <button
          data-testid="trigger-content-change"
          onClick={() =>
            onChange?.({
              toJSON: () => JSON.parse(editorJson),
            } as unknown as EditorState)
          }
          type="button"
        />
      )
    },
  }
})

beforeAll(() => rootLayoutServer.listen())
afterEach(() => {
  vi.resetAllMocks()
  vi.restoreAllMocks()
  rootLayoutServer.resetHandlers()
})
afterAll(() => rootLayoutServer.close())

const PROPS: PropsOf<typeof EditPostForm> = { post: AUTHORED_POST }

describe('<EditPostForm />', () => {
  it.each(['content-input', 'description-input', 'id-input', 'title-input'])(
    'should render the post inputs',
    (id) => {
      renderWithProviders(<EditPostForm {...PROPS} />)
      expect(screen.getByTestId(id)).toBeInTheDocument()
    },
  )

  it('should fire autosave after a 1-second debounce', async () => {
    vi.useFakeTimers()
    vi.spyOn(PostRepository, 'update').mockResolvedValueOnce(UNPUBLISHED_POST)
    mockServerSession('ADMIN')
    renderWithProviders(<EditPostForm {...PROPS} />, { includesSession: true })
    fireEvent.change(screen.getByTestId('title-input'), {
      target: { value: 'updated title' },
    })
    expect(PostRepository.update).not.toHaveBeenCalled()
    await act(() => vi.advanceTimersByTimeAsync(1000))
    expect(PostRepository.update).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })

  it('should update the content input value when the editor changes', () => {
    renderWithProviders(<EditPostForm {...PROPS} />)
    fireEvent.click(screen.getByTestId('trigger-content-change'))
    const contentInput = screen.getByTestId('content-input') as HTMLInputElement
    expect(contentInput.value).toBe(
      JSON.stringify(JSON.parse(LEXICAL_EDITOR_JSON)),
    )
  })

  it('should fire autosave after a 1-second debounce when the editor changes', async () => {
    vi.useFakeTimers()
    vi.spyOn(PostRepository, 'update').mockResolvedValueOnce(UNPUBLISHED_POST)
    mockServerSession('ADMIN')
    renderWithProviders(<EditPostForm {...PROPS} />, { includesSession: true })
    fireEvent.click(screen.getByTestId('trigger-content-change'))
    expect(PostRepository.update).not.toHaveBeenCalled()
    await act(() => vi.advanceTimersByTimeAsync(1000))
    expect(PostRepository.update).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })

  it('should reset the debounce timer when the field changes again before 1 second', async () => {
    vi.useFakeTimers()
    vi.spyOn(PostRepository, 'update').mockResolvedValue(UNPUBLISHED_POST)
    mockServerSession('ADMIN')
    renderWithProviders(<EditPostForm {...PROPS} />, { includesSession: true })
    fireEvent.change(screen.getByTestId('title-input'), {
      target: { value: 'first change' },
    })
    await act(() => vi.advanceTimersByTimeAsync(500))
    fireEvent.change(screen.getByTestId('title-input'), {
      target: { value: 'second change' },
    })
    await act(() => vi.advanceTimersByTimeAsync(1000))
    expect(PostRepository.update).toHaveBeenCalledTimes(1)
    vi.useRealTimers()
  })
})

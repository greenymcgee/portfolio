import { faker } from '@faker-js/faker'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { LexicalToolbarWrapper } from '@/test/components'
import { FIRST_PARAGRAPH_TEXT, SECOND_PARAGRAPH_TEXT } from '@/test/fixtures'

import { ACTIVE_BUTTON_CLASS, BLOCK_TYPE_LABELS } from '../../constants'
import { ToolbarPlugin } from '../toolbarPlugin'

describe('<ToolbarPlugin />', () => {
  describe('alignment', () => {
    it.each([
      { name: 'Center Align', textAlign: 'center' },
      { name: 'Left Align', textAlign: 'left' },
      { name: 'Right Align', textAlign: 'right' },
      { name: 'Justify Align', textAlign: 'justify' },
    ])('should render controls', async ({ name, textAlign }) => {
      const user = userEvent.setup()
      render(
        <LexicalToolbarWrapper>
          <ToolbarPlugin />
        </LexicalToolbarWrapper>,
      )
      const editor = screen.getByRole('textbox')
      await user.click(editor)
      await user.keyboard(faker.lorem.word())
      await user.click(screen.getByRole('button', { name }))
      await waitFor(() => {
        expect(editor.querySelector('p')).toHaveStyle({ textAlign })
      })
    })
  })

  describe('block type', () => {
    it('should render controls', async () => {
      const user = userEvent.setup()
      render(
        <LexicalToolbarWrapper>
          <ToolbarPlugin />
        </LexicalToolbarWrapper>,
      )
      const editor = screen.getByRole('textbox')
      await user.click(editor)
      await user.selectOptions(
        screen.getByRole('combobox', { name: 'Block type' }),
        screen.getByRole('option', { name: BLOCK_TYPE_LABELS.h2 }),
      )
      expect(screen.getByText('Heading 2')).toBeVisible()
    })
  })

  describe('formatting', () => {
    it.each([
      'Format Bold',
      'Format Italics',
      'Format Underline',
      'Format Strikethrough',
    ])('should render controls', async (name) => {
      const user = userEvent.setup()
      render(
        <LexicalToolbarWrapper>
          <ToolbarPlugin />
        </LexicalToolbarWrapper>,
      )
      const editor = screen.getByRole('textbox')
      await user.click(editor)
      await user.keyboard(faker.lorem.word())
      await user.click(screen.getByRole('button', { name }))
      await waitFor(() => {
        expect(screen.getByRole('button', { name })).toHaveClass(
          ACTIVE_BUTTON_CLASS,
        )
      })
    })
  })

  describe('undo and redo', () => {
    it('should render controls', async () => {
      /* eslint-disable vitest/max-expects -- one integration flow with multiple waitFor checkpoints */
      const user = userEvent.setup()
      const onReady = vi.fn()
      render(
        <LexicalToolbarWrapper onUndoableHistoryReady={onReady}>
          <ToolbarPlugin />
        </LexicalToolbarWrapper>,
      )
      await waitFor(() => expect(onReady).toHaveBeenCalled())
      const editor = screen.getByRole('textbox')
      const undo = screen.getByRole('button', { name: 'Undo' })
      const redo = screen.getByRole('button', { name: 'Redo' })
      await user.click(undo)
      await waitFor(() => {
        expect(
          [
            editor.textContent?.trim(),
            String(redo.hasAttribute('disabled')),
            String(undo.hasAttribute('disabled')),
          ].join('|'),
        ).toBe(`${FIRST_PARAGRAPH_TEXT}|false|true`)
      })
      await user.click(redo)
      await waitFor(() => {
        expect(
          [
            editor.textContent?.trim(),
            String(redo.hasAttribute('disabled')),
            String(undo.hasAttribute('disabled')),
          ].join('|'),
        ).toBe(`${SECOND_PARAGRAPH_TEXT}|true|false`)
      })
      /* eslint-enable vitest/max-expects */
    })
  })
})

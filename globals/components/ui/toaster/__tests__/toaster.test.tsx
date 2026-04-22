import { render, screen, waitFor } from '@testing-library/react'
import { ThemeProvider } from 'next-themes'
import { toast } from 'sonner'

import { Toaster } from '..'

const PROPS: PropsOf<typeof Toaster> = {}

function getToasterList() {
  return document.querySelector('[data-sonner-toaster]')
}

async function showToast(message: string = 'Hello') {
  toast(message)
  await waitFor(() => {
    expect(getToasterList()).toBeInTheDocument()
  })
  return getToasterList() as HTMLElement
}

beforeEach(() => {
  toast.dismiss()
})

describe('<Toaster />', () => {
  it('should render the notifications region', () => {
    render(<Toaster {...PROPS} />)
    expect(
      screen.getByRole('region', { name: /notifications/i }),
    ).toBeInTheDocument()
  })

  it('should apply the theme from next-themes to the toaster list', async () => {
    render(
      <ThemeProvider defaultTheme="light" enableSystem={false}>
        <Toaster {...PROPS} />
      </ThemeProvider>,
    )
    const list = await showToast()
    expect(list.getAttribute('data-sonner-theme')).toBe('light')
  })

  it('should resolve the system theme when next-themes does not supply a theme', async () => {
    render(<Toaster {...PROPS} />)
    const list = await showToast()
    expect(list.getAttribute('data-sonner-theme')).toBe('light')
  })

  it('should default the toaster list position to top center', async () => {
    render(<Toaster {...PROPS} />)
    const list = await showToast()
    expect(list.getAttribute('data-y-position')).toBe('top')
    expect(list.getAttribute('data-x-position')).toBe('center')
  })

  it('should forward a custom position to the toaster list', async () => {
    render(<Toaster {...PROPS} position="bottom-right" />)
    const list = await showToast()
    expect(list.getAttribute('data-y-position')).toBe('bottom')
    expect(list.getAttribute('data-x-position')).toBe('right')
  })

  it('should apply default toaster class names to the toaster list', async () => {
    render(<Toaster {...PROPS} />)
    const list = await showToast()
    expect(list).toHaveClass('toaster', 'group')
  })

  it('should override default class names when className is provided', async () => {
    render(<Toaster {...PROPS} className="extra" />)
    const list = await showToast()
    expect(list).toHaveClass('extra')
  })

  it('should set CSS variables on the toaster list for toast styling', async () => {
    render(<Toaster {...PROPS} />)
    const list = await showToast()
    expect(list).toHaveStyle({
      '--border-radius': 'var(--radius)',
      '--normal-bg': 'var(--popover)',
      '--normal-border': 'var(--border)',
      '--normal-text': 'var(--popover-foreground)',
    })
  })

  it('should apply the cn-toast class from toastOptions to each toast', async () => {
    render(<Toaster {...PROPS} />)
    await showToast()
    expect(document.querySelector('[data-sonner-toast]')).toHaveClass(
      'cn-toast',
    )
  })

  it('should render a custom error icon from Lucide', async () => {
    render(<Toaster {...PROPS} />)
    toast.error('Failed')
    await waitFor(() => {
      expect(
        document.querySelector('[data-icon] svg.lucide-octagon-x'),
      ).toBeInTheDocument()
    })
  })

  it('should render a custom info icon from Lucide', async () => {
    render(<Toaster {...PROPS} />)
    toast.info('Note')
    await waitFor(() => {
      expect(
        document.querySelector('[data-icon] svg.lucide-info'),
      ).toBeInTheDocument()
    })
  })

  it('should render a custom loading icon from Lucide', async () => {
    render(<Toaster {...PROPS} />)
    toast.loading('Wait')
    await waitFor(() => {
      expect(
        document.querySelector('[data-icon] svg.lucide-loader-circle'),
      ).toBeInTheDocument()
    })
  })

  it('should render a custom success icon from Lucide', async () => {
    render(<Toaster {...PROPS} />)
    toast.success('Done')
    await waitFor(() => {
      expect(
        document.querySelector('[data-icon] svg.lucide-circle-check'),
      ).toBeInTheDocument()
    })
  })

  it('should render a custom warning icon from Lucide', async () => {
    render(<Toaster {...PROPS} />)
    toast.warning('Careful')
    await waitFor(() => {
      expect(
        document.querySelector('[data-icon] svg.lucide-triangle-alert'),
      ).toBeInTheDocument()
    })
  })

  it('should forward closeButton and richColors to each toast', async () => {
    render(
      <ThemeProvider defaultTheme="light" enableSystem={false}>
        <Toaster {...PROPS} closeButton richColors />
      </ThemeProvider>,
    )
    await showToast()
    const toastElement = document.querySelector('[data-sonner-toast]')
    expect(toastElement).toHaveAttribute('data-rich-colors')
    expect(
      screen.getByRole('button', { name: 'Close toast' }),
    ).toBeInTheDocument()
  })
})

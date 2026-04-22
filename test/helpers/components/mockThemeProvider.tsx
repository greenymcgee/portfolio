import { ThemeProvider, type ThemeProviderProps } from 'next-themes'

type Props = ThemeProviderProps & {
  includesTheme: boolean
}

export function MockThemeProvider({ includesTheme, ...props }: Props) {
  if (includesTheme) {
    return (
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        {...props}
      />
    )
  }

  return <>{props.children}</>
}

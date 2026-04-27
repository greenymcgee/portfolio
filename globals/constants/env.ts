function getBaseApiUrl() {
  if (
    process.env.VERCEL_ENV === 'preview' ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview'
  ) {
    const host = process.env.VERCEL_URL ?? process.env.NEXT_PUBLIC_VERCEL_URL
    return `https://${host}`
  }

  return (
    process.env.BASE_PORTFOLIO_API_URL ??
    process.env.NEXT_PUBLIC_BASE_PORTFOLIO_API_URL
  )
}

export const BASE_API_URL = getBaseApiUrl()

export const AUTH_SECRET = process.env.AUTH_SECRET

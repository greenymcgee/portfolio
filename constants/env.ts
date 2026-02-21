function getBaseApiUrl() {
  const url = process.env.VERCEL_URL ?? process.env.NEXT_PUBLIC_VERCEL_URL
  if (process.env.NODE_ENV === 'production') return `https://${url}/api`

  return `http://${url}/api`
}

export const BASE_API_URL = getBaseApiUrl()

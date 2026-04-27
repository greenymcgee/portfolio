import type { NextConfig } from 'next'

const { BASE_PORTFOLIO_API_URL, VERCEL_ENV, VERCEL_URL } = process.env

const nextConfig: NextConfig = {
  cacheComponents: true,
  env: {
    NEXT_PUBLIC_BASE_PORTFOLIO_API_URL: BASE_PORTFOLIO_API_URL,
    NEXT_PUBLIC_VERCEL_URL: VERCEL_URL,
  },
  // eslint-disable-next-line require-await
  async headers() {
    return [
      {
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value:
              VERCEL_ENV === 'preview'
                ? `https://${VERCEL_URL}`
                : (BASE_PORTFOLIO_API_URL as string),
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Accept, Content-Type, Authorization',
          },
        ],
        source: '/api/:path*',
      },
    ]
  },
  typedRoutes: true,
}

export default nextConfig

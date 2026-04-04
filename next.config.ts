import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  env: { NEXT_PUBLIC_VERCEL_URL: process.env.VERCEL_URL },
  typedRoutes: true,
}

export default nextConfig

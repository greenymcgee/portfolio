import { headers } from 'next/headers'

export async function mockCookieHeader() {
  const { get } = await headers()
  vi.mocked(get).mockReturnValue('cookie')
}

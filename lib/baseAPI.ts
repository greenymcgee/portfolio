import { Summoner } from '@greenymcgee/summon'

import { BASE_API_URL } from '@/globals/constants'

export const baseAPI = new Summoner({
  baseURL: BASE_API_URL,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
})

/* eslint-disable @typescript-eslint/no-explicit-any */
import { API_ROUTES, BASE_API_URL } from '@/constants'

type RouteKey = keyof typeof API_ROUTES
type RouteArgs<
  Key extends RouteKey,
  Value extends (typeof API_ROUTES)[Key],
> = Value extends (...args: any[]) => any ? Parameters<Value> : never

function callRoute<Route extends (...args: any[]) => string>(
  route: Route,
  args: Parameters<Route>,
): string {
  return route(...args)
}

export function getApiUrl<Key extends RouteKey>(
  key: Key,
  args?: RouteArgs<Key, (typeof API_ROUTES)[Key]>,
) {
  const route = API_ROUTES[key]
  if (typeof route === 'function' && Array.isArray(args)) {
    return `${BASE_API_URL}${callRoute(route, args)}`
  }

  return `${BASE_API_URL}${route}`
}

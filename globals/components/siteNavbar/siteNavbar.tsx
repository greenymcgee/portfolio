import { Suspense } from 'react'
import clsx from 'clsx'
import Link from 'next/link'

import { ROUTES } from '@/globals/constants'

import { AdminMenu } from '../adminMenu'
import { SITE_NAVBAR_CLASSNAMES } from './classNames'

type Props = { pathname: string }

/**
 * This is the public facing part of the app's navbar.
 *
 * @returns {JSX} JSX
 */
export function SiteNavbar({ pathname }: Props) {
  const postsRouteActive = pathname !== ROUTES.home

  return (
    <nav className="flex items-center gap-4" data-testid="site-navbar">
      <Suspense>
        <AdminMenu />
      </Suspense>
      <div
        className={clsx(
          'text-muted-foreground bg-muted relative ml-auto',
          'rounded-full border',
        )}
      >
        <div
          className={clsx(
            'bg-muted-foreground absolute top-0 left-0 h-10.5 rounded-full border',
            'transition-all duration-200 ease-out',
            {
              'w-16 translate-x-full': pathname !== ROUTES.home,
              'w-18': pathname === ROUTES.home,
            },
          )}
        />
        <Link
          className={clsx('mr-4.5 pl-3.5', SITE_NAVBAR_CLASSNAMES.link, {
            [SITE_NAVBAR_CLASSNAMES.activeLink]: pathname === ROUTES.home,
          })}
          href={ROUTES.home}
        >
          Work
        </Link>
        <Link
          className={clsx('pr-3.5', SITE_NAVBAR_CLASSNAMES.link, {
            [SITE_NAVBAR_CLASSNAMES.activeLink]: postsRouteActive,
          })}
          data-testid={postsRouteActive ? 'active-posts-link' : undefined}
          href={ROUTES.posts}
        >
          Blog
        </Link>
      </div>
    </nav>
  )
}

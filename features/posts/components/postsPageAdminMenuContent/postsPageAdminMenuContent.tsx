import { Suspense } from 'react'
import { CirclePlus } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/globals/components/ui'
import { ROUTES } from '@/globals/constants'

import { UnpublishedPostsToggle } from '../unpublishedPostsToggle'

export function PostsPageAdminMenuContent() {
  return (
    <nav data-testid="posts-admin-menu-content">
      <Button asChild className="flex justify-start" variant="ghost">
        <Link href={ROUTES.newPost}>
          <CirclePlus className="inline h-[1em] w-[1em] align-middle" />{' '}
          <span className="align-middle">New Post</span>
        </Link>
      </Button>
      <Suspense>
        <UnpublishedPostsToggle />
      </Suspense>
    </nav>
  )
}

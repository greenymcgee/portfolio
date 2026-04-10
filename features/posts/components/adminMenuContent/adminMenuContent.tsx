import { Plus } from 'lucide-react'
import Link from 'next/link'

import { ROUTES } from '@/globals/constants'

export function PostsAdminMenuContent() {
  return (
    <nav data-testid="posts-admin-menu-content">
      <Link href={ROUTES.newPost}>
        <Plus className="inline h-[1em] w-[1em] align-middle" />{' '}
        <span className="align-middle">New Post</span>
      </Link>
    </nav>
  )
}

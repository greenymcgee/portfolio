import { Suspense } from 'react'

import { NewPostForm } from '../newPostForm'
import { UnpublishedPostsToggle } from '../unpublishedPostsToggle'

export function PostsPageAdminMenuContent() {
  return (
    <nav data-testid="posts-admin-menu-content">
      <NewPostForm />
      <Suspense>
        <UnpublishedPostsToggle />
      </Suspense>
    </nav>
  )
}

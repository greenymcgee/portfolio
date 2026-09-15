import { Skeleton } from '@/globals/components/ui'

import { POST_PAGE_CLASS_NAMES } from '../../constants'

export function EditPostSkeleton() {
  return (
    <div
      aria-label="Loading post"
      data-testid="edit-post-skeleton"
      role="status"
    >
      <div
        className={POST_PAGE_CLASS_NAMES.editActionBar}
        data-testid="edit-post-skeleton-action-bar"
      >
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-40" />
      </div>
      <div
        className={POST_PAGE_CLASS_NAMES.editTitleBlock}
        data-testid="edit-post-skeleton-title-block"
      >
        <Skeleton className="h-7 w-2/3" />
        <Skeleton
          className="h-3 w-40"
          data-testid="edit-post-skeleton-byline"
        />
      </div>
      <div
        className={POST_PAGE_CLASS_NAMES.editFormWidth}
        data-testid="edit-post-skeleton-editor-body"
      >
        <Skeleton className="w-full" style={{ height: '480px' }} />
      </div>
    </div>
  )
}

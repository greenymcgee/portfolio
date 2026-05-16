import { Suspense } from 'react'

import { EditPostContent } from '@/features/posts/components'

export default function EditPostPage({
  params,
}: PropsOf<typeof EditPostContent>) {
  return (
    <Suspense fallback={<p data-testid="edit-post-loader">Loading post</p>}>
      <EditPostContent params={params} />
    </Suspense>
  )
}

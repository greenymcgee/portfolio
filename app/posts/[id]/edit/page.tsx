import { Suspense } from 'react'

import { EditPostContent, EditPostSkeleton } from '@/features/posts/components'

export default function EditPostPage({
  params,
}: PropsOf<typeof EditPostContent>) {
  return (
    <main>
      <Suspense fallback={<EditPostSkeleton />}>
        <EditPostContent params={params} />
      </Suspense>
    </main>
  )
}

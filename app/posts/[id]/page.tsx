import { Suspense } from 'react'

import { PostPageContent } from '@/features/posts/components'

export default function PostPage({ params }: PropsOf<typeof PostPageContent>) {
  return (
    <Suspense fallback={<p data-testid="post-loader">Loading post</p>}>
      <PostPageContent params={params} />
    </Suspense>
  )
}

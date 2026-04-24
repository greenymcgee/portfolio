import { AdminMenuContentSetter, RichTextEditor } from '@/globals/components'
import { Heading } from '@/globals/components/ui'

import { getPost } from '../../actions'
import { PostPageAdminMenuContent } from '../postPageAdminMenuContent'

type Props = { params: Promise<{ id: number }> }

export async function PostPageContent({ params }: Props) {
  const { id } = await params
  const { error, post } = await getPost(id)

  if (error) {
    return (
      <main className="pt-28">
        <Heading>Something went wrong</Heading>
      </main>
    )
  }

  return (
    <main className="pt-28">
      <AdminMenuContentSetter
        content={<PostPageAdminMenuContent post={post} />}
      />
      <article>
        <Heading>{post.title}</Heading>
        <RichTextEditor
          initialState={typeof post.content === 'string' ? post.content : null}
        />
      </article>
    </main>
  )
}

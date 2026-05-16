import { getPost } from '../../actions'
import { EditPostForm } from '../editPostForm'
import { EditPostPolicyEnforcer } from '../editPostPolicyEnforcer'

type Props = { params: Promise<{ id: number }> }

export async function EditPostContent({ params }: Props) {
  const { id } = await params
  const { error, post } = await getPost(id)

  if (error) {
    return <h1 data-testid="edit-post-content-error">Something went wrong</h1>
  }

  return (
    <>
      <h1 className="sr-only">Edit: {post.title}</h1>
      <EditPostForm post={post} />
      <EditPostPolicyEnforcer />
    </>
  )
}

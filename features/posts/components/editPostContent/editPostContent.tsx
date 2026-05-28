import { getPost } from '../../actions'
import { EditPostForm } from '../editPostForm'
import { EditPostPolicyEnforcer } from '../editPostPolicyEnforcer'

type Props = { params: Promise<{ id: number }> }

export async function EditPostContent({ params }: Props) {
  const { id } = await params
  const { errorType, post } = await getPost(id)

  if (errorType) {
    return (
      <header data-testid="edit-post-content-error">
        <h1>Edit post page</h1>
        <p className="text-destructive">Something went wrong</p>
      </header>
    )
  }

  return (
    <>
      <h1 className="sr-only">Edit: {post.title}</h1>
      <EditPostForm post={post} />
      <EditPostPolicyEnforcer />
    </>
  )
}

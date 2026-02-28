import { CreatePostForm } from '@/features/posts/components'

export default function NewPostPage() {
  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="mb-6 text-2xl font-bold" data-testid="create-post-heading">
        Create New Post
      </h1>
      <CreatePostForm />
    </div>
  )
}

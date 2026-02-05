'use client'

import Form from 'next/form'

import { createPost } from './actions'

export default function NewPost() {
  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="mb-6 text-2xl font-bold">Create New Post</h1>
      <Form action={createPost} className="space-y-6">
        <div>
          <label
            className="mb-2 flex items-center text-lg font-medium"
            htmlFor="title"
          >
            Title
            <span className="ml-2 rounded-lg bg-gray-500 px-2 py-1 text-xs font-semibold text-white">
              Required
            </span>
          </label>
          <input
            className="w-full rounded-lg border px-4 py-2"
            id="title"
            name="title"
            placeholder="Enter your post title ..."
            required
            type="text"
          />
        </div>
        <div>
          <label className="mb-2 block text-lg font-medium" htmlFor="content">
            Content
          </label>
          <textarea
            className="w-full rounded-lg border px-4 py-2"
            id="content"
            name="content"
            placeholder="Write your post content here ..."
            rows={6}
          />
        </div>
        <button
          className="w-full rounded-lg bg-blue-500 py-3 text-white hover:bg-blue-600"
          type="submit"
        >
          Create Post
        </button>
      </Form>
    </div>
  )
}

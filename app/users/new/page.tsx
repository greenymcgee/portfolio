export const dynamic = 'force-dynamic' // This disables SSG and ISR

import Form from 'next/form'
import { redirect } from 'next/navigation'

import prisma from '@/lib/prisma'

export default function NewUser() {
  async function createUser(formData: FormData) {
    'use server'

    const name = formData.get('name') as string
    const email = formData.get('email') as string

    await prisma.user.create({
      data: { email, name, password: '' }, // password will be added by NextAuth
    })

    redirect('/')
  }

  return (
    <div className="mx-auto mt-12 max-w-2xl rounded-lg bg-white p-6 shadow-md">
      <h1 className="mb-6 text-3xl font-bold">Create New User</h1>
      <Form action={createUser} className="space-y-6">
        <div>
          <label className="mb-2 block text-lg font-medium" htmlFor="name">
            Name
          </label>
          <input
            className="w-full rounded-lg border px-4 py-2"
            id="name"
            name="name"
            placeholder="Enter user name ..."
            type="text"
          />
        </div>
        <div>
          <label
            className="mb-2 flex items-center text-lg font-medium"
            htmlFor="email"
          >
            Email
            <span className="ml-2 rounded-lg bg-gray-500 px-2 py-1 text-xs font-semibold text-white">
              Required
            </span>
          </label>
          <input
            className="w-full rounded-lg border px-4 py-2"
            id="email"
            name="email"
            placeholder="Enter user email ..."
            required
            type="email"
          />
        </div>
        <button
          className="w-full rounded-lg bg-blue-500 py-3 text-white hover:bg-blue-600"
          type="submit"
        >
          Create User
        </button>
      </Form>
    </div>
  )
}

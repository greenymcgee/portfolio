import Link from 'next/link'

import { RegisterForm } from '@/features/users/components'
import { Button, Heading } from '@/globals/components/ui'
import { ROUTES } from '@/globals/constants'

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <Heading
          className="text-center"
          data-testid="register-page-heading"
          size="2xl"
        >
          Create your account
        </Heading>
        <RegisterForm />
        <Button asChild className="text-center" variant="link">
          <Link href={ROUTES.login}>Already have an account? Sign in</Link>
        </Button>
      </div>
    </main>
  )
}

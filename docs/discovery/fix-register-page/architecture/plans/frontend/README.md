# Frontend — fix-register-page

> Part of [fix-register-page architecture](../README.md). Source slice:
> [architecture.md](../../architecture.md) §6.13.

The frontend slice splits into three concerns following
`.cursor/skills/clean-authoring/SKILL.md` (thin entry point +
orchestrator/presenter):

| Concern | File | Owns |
| --- | --- | --- |
| Components (orchestrator + presenter) | [`./components.md`](./components.md) | `RegisterForm` + `RegisterFormBody` shape, props, testids. |
| State management | [`./state-management.md`](./state-management.md) | `useActionState` + `withCallbacks` wiring, error-message client state. |
| Page (thin entry) | this file (below) | Layout + "Sign in" link only. |

## Page (`app/register/page.tsx`)

Rewrite to a thin entry point:

```tsx
import Link from 'next/link'

import { RegisterForm } from '@/features/users/components'
import { ROUTES } from '@/globals/constants'

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <h2
          className="mt-6 text-center text-3xl font-extrabold text-gray-900"
          data-testid="register-page-heading"
        >
          Create your account
        </h2>
        <RegisterForm />
        <div className="text-center">
          <Link className="text-blue-600 hover:underline" href={ROUTES.login}>
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </main>
  )
}
```

Drops the `signIn` import, the `useState`, the `handleSubmit`, and the
inline `<form>`. The page owns layout + the "Sign in" link only — no
state, no effects, no validation.

## Styling

Constraint #2 in [`../../inputs/constraints.md`](../../inputs/constraints.md):
"Design is not a key concern for this project. Only making the register
page work by building proper architecture is the goal."

The Tailwind classes above carry over from the existing register page.
No `styling.md` file is generated for this project — the styling
surface is a single page-level layout block, fully self-contained
above. Future work that introduces design tokens or a redesign should
add `styling.md` then.

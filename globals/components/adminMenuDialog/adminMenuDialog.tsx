import { useCallback, useRef, useState } from 'react'
import { tryCatch } from '@greenymcgee/typescript-utils'
import { Menu } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'

import { hasPermission } from '@/lib/permissions'
import type { AdminMenuContextType } from '@/providers'

import { SessionStatus } from '../sessionStatus'
import { debouncePopoverInteraction } from './utils'

type Props = { content: NonNullable<AdminMenuContextType['content']> }

export function AdminMenuDialog({ content }: Props) {
  const { data: session, status } = useSession()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [signoutError, setSignoutError] = useState('')
  const [signingOut, setSigningOut] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>(null)

  const hidePopover = useCallback(() => {
    debouncePopoverInteraction({
      callback() {
        setExpanded(false)
        dialogRef.current?.hidePopover()
      },
      duration: 50,
      timeoutRef,
    })
  }, [])

  const showPopover = useCallback(() => {
    debouncePopoverInteraction({
      callback() {
        dialogRef.current?.showPopover()
        setExpanded(true)
      },
      duration: 10,
      timeoutRef,
    })
  }, [])

  const handleSignout = useCallback(async () => {
    setSignoutError('')
    setSigningOut(true)
    const { error } = await tryCatch(signOut())
    if (error) {
      setSignoutError("Couldn't sign out")
      return setSigningOut(false)
    }

    setSigningOut(false)
  }, [])

  if (
    status === 'loading' ||
    !session ||
    !hasPermission(session.user, 'adminMenu', 'view')
  ) {
    return <SessionStatus status={status} />
  }

  return (
    <div
      className="relative flex"
      onBlur={hidePopover}
      onFocusCapture={showPopover}
    >
      <button
        aria-expanded={expanded}
        aria-label="Open Admin Menu"
        className="cursor-pointer text-xl"
        data-testid="admin-menu-toggle"
        onPointerEnter={showPopover}
        onPointerLeave={hidePopover}
        style={{ anchorName: '--admin-menu-anchor' }}
        type="button"
      >
        <Menu aria-hidden className="h-[1em] w-[1em]" />
      </button>
      <dialog
        className="bg-on-app-surface-alt text-app-surface-alt absolute top-[anchor(bottom)] right-[anchor(right)] left-auto rounded-sm px-4 py-2"
        id="admin-menu-popover"
        onPointerEnter={showPopover}
        onPointerLeave={hidePopover}
        popover="auto"
        ref={dialogRef}
        style={{ positionAnchor: '--admin-menu-anchor' }}
      >
        {signoutError ? (
          <p data-testid="sign-out-error">{signoutError}</p>
        ) : null}
        {signingOut ? (
          <p data-testid="sign-out-loader">Signing out</p>
        ) : (
          <>
            {content}
            <hr className="my-3" />
            <button
              className="cursor-pointer"
              onClick={handleSignout}
              type="button"
            >
              Sign Out
            </button>
          </>
        )}
      </dialog>
    </div>
  )
}

import { useCallback, useRef, useState } from 'react'
import { tryCatch } from '@greenymcgee/typescript-utils'
import clsx from 'clsx'
import { Menu } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'

import { hasPermission } from '@/lib/permissions'
import type { AdminMenuContextType } from '@/providers'

import { SessionStatus } from '../sessionStatus'
import { Button } from '../ui'
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
      <Button
        aria-expanded={expanded}
        aria-label="Open Admin Menu"
        className="bg-background h-[unset] py-1"
        data-testid="admin-menu-toggle"
        onPointerEnter={showPopover}
        onPointerLeave={hidePopover}
        size="lg"
        style={{ anchorName: '--admin-menu-anchor' }}
        variant="ghost"
      >
        <Menu aria-hidden className="size-8" />
      </Button>
      <dialog
        className={clsx(
          'text-background bg-foreground absolute rounded-sm',
          'top-[calc(anchor(bottom)+0.25rem)] right-auto left-[anchor(left)]',
        )}
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
            <div className="px-1 pt-2">{content}</div>
            <hr className="border-subtle my-3" />
            <div className="px-1 pb-2">
              <Button
                onClick={handleSignout}
                type="button"
                variant="outline-inverse"
              >
                Sign Out
              </Button>
            </div>
          </>
        )}
      </dialog>
    </div>
  )
}

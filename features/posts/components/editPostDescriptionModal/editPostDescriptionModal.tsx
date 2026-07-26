import { ChangeEvent, useActionState, useCallback, useState } from 'react'
import { withCallbacks } from '@greenymcgee/typescript-utils'
import { toast } from 'sonner'

import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Field,
  FieldError,
  FieldGroup,
  Label,
  Spinner,
  Textarea,
} from '@/globals/components/ui'
import { Post } from '@/prisma/generated/client'

import { updatePost } from '../../actions'
import { UpdatePostState } from '../../types'

type Props = {
  defaultDescription: string | undefined
  postId: Post['id']
  title: Post['title']
}

export function EditPostDescriptionModal({
  defaultDescription,
  postId,
  title,
}: Props) {
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState(defaultDescription)
  const [updateFailedUnexpectedly, setUpdateFailedUnexpectedly] =
    useState(false)
  const [updateNotFound, setUpdateNotFound] = useState(false)
  const initialState: UpdatePostState = {
    description,
    id: postId,
    status: 'IDLE',
  }
  const [state = initialState, action, updating] = useActionState(
    withCallbacks(updatePost, {
      onError({ errorType }) {
        switch (errorType) {
          case 'dto':
            return
          case 'not-found':
            return setUpdateNotFound(true)
          case 'entity':
          case 'lexical':
          case 'unhandled':
          default:
            return setUpdateFailedUnexpectedly(true)
        }
      },
      onStart() {
        setUpdateFailedUnexpectedly(false)
        setUpdateNotFound(false)
      },
      onSuccess() {
        setOpen(false)
        toast.success('The description has been saved', { closeButton: true })
      },
    }),
    initialState,
  )

  const handleDescriptionChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setDescription(event.currentTarget.value)
    },
    [],
  )

  return (
    <Dialog modal onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button variant="secondary">Description</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            <span className="sr-only">Enter a description</span>
            {updateFailedUnexpectedly ? (
              <FieldError>Something went wrong</FieldError>
            ) : null}
            {updateNotFound ? (
              <FieldError>The post could not be found</FieldError>
            ) : null}
          </DialogDescription>
        </DialogHeader>
        <form action={action}>
          <FieldGroup className="mb-4">
            <Field>
              <Label htmlFor="description">Description</Label>
              <FieldError errors={state.dtoError?.fieldErrors.description} />
              <Textarea
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
                disabled={updating}
                id="description"
                name="description"
                onChange={handleDescriptionChange}
                value={description}
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button disabled={updating} variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button disabled={updating || !description} type="submit">
              Save changes {updating ? <Spinner /> : null}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

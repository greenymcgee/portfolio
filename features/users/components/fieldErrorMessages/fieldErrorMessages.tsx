type Props = {
  id: string
  messages: string[] | undefined
}

export function FieldErrorMessages({ id, messages }: Props) {
  if (!messages?.length) return null

  return (
    <div aria-live="polite" className="mt-1" id={`field-errors-${id}`}>
      {messages.map((message, index) => (
        <p
          className="text-destructive text-sm"
          key={`${id}-${index}-${message}`}
        >
          {message}
        </p>
      ))}
    </div>
  )
}

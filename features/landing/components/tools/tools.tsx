type Props = {
  tools: SoftwareTool[]
}

export function Tools({ tools }: Props) {
  return (
    <ul
      className="grid grid-cols-2 grid-rows-2 gap-2 sm:flex"
      data-testid="card-tools"
    >
      {tools.map((tool) => (
        <li
          className="bg-primary/10 text-primary rounded-full border px-2 py-1 text-sm"
          key={tool}
        >
          {tool}
        </li>
      ))}
    </ul>
  )
}

import { useId, useState } from "react"
import Button from "../ui/Button"

interface PostTextProps {
  content: string
  className?: string
}

const COLLAPSE_THRESHOLD = 360

export default function PostText({ content, className = "" }: PostTextProps) {
  const [expanded, setExpanded] = useState(false)
  const buttonId = useId()

  if (!content) {
    return null
  }

  const long = content.length > COLLAPSE_THRESHOLD
  const visible = long && !expanded ? content.slice(0, COLLAPSE_THRESHOLD) : content

  return (
    <div className={className}>
      <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-foreground">
        {visible}
        {long && !expanded && <span aria-hidden="true">…</span>}
      </p>
      {long && (
        <div className="mt-1">
          <Button
            id={buttonId}
            variant="link"
            size="sm"
            onClick={() => setExpanded((current) => !current)}
            aria-expanded={expanded}
          >
            {expanded ? "Mostrar menos" : "Mostrar mais"}
          </Button>
        </div>
      )}
    </div>
  )
}

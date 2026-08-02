import type { TextareaHTMLAttributes } from "react"

interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
}

const BASE =
  "w-full rounded-md border bg-surface px-3 py-2 text-sm text-foreground transition-colors placeholder:text-foreground-subtle disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-60"

export default function Textarea({
  invalid = false,
  className = "",
  ...rest
}: TextareaProps) {
  return (
    <textarea
      aria-invalid={invalid || undefined}
      className={[
        BASE,
        invalid
          ? "border-danger focus:border-danger"
          : "border-border focus:border-primary",
        className,
      ].join(" ")}
      {...rest}
    />
  )
}

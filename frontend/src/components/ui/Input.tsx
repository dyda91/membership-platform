import type { InputHTMLAttributes } from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

const BASE =
  "h-10 w-full rounded-md border bg-surface px-3 text-sm text-foreground transition-colors placeholder:text-foreground-subtle disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-60"

export default function Input({
  invalid = false,
  className = "",
  ...rest
}: InputProps) {
  return (
    <input
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

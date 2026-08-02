import type { SelectHTMLAttributes } from "react"

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean
}

const BASE =
  "h-10 w-full rounded-md border bg-surface px-3 pr-8 text-sm text-foreground transition-colors disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-60"

export default function Select({
  invalid = false,
  className = "",
  children,
  ...rest
}: SelectProps) {
  return (
    <select
      aria-invalid={invalid || undefined}
      className={[
        BASE,
        invalid
          ? "border-danger focus:border-danger"
          : "border-border focus:border-primary",
        className,
      ].join(" ")}
      {...rest}
    >
      {children}
    </select>
  )
}

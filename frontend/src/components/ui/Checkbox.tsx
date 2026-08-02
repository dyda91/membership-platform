import type { InputHTMLAttributes } from "react"
import type { ReactNode } from "react"

interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode
}

export default function Checkbox({
  label,
  id,
  className = "",
  ...rest
}: CheckboxProps) {
  const control = (
    <input
      type="checkbox"
      id={id}
      className={[
        "h-4 w-4 shrink-0 rounded border-border text-primary focus:ring-2 focus:ring-primary/30 focus:ring-offset-2",
        className,
      ].join(" ")}
      {...rest}
    />
  )

  if (!label) {
    return control
  }

  return (
    <label
      htmlFor={id}
      className="inline-flex cursor-pointer items-center gap-2 text-sm text-foreground"
    >
      {control}
      {label}
    </label>
  )
}

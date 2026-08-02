import type {
  ButtonHTMLAttributes,
  ReactNode,
  Ref,
} from "react"
import Spinner from "./Spinner"
import { buttonClasses } from "./button-styles"
import type { ButtonSize, ButtonVariant } from "./button-styles"

export type { ButtonSize, ButtonVariant }

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  fullWidth?: boolean
  icon?: ReactNode
  ref?: Ref<HTMLButtonElement>
}

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  icon,
  disabled,
  type = "button",
  className = "",
  children,
  ref,
  ...rest
}: ButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses(
        variant,
        size,
        [fullWidth ? "w-full" : "", className].join(" "),
      )}
      {...rest}
    >
      {loading && <Spinner size={size === "sm" ? "sm" : "md"} />}
      {!loading && icon}
      {children}
    </button>
  )
}

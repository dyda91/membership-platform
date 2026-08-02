import type { ButtonHTMLAttributes, ReactNode, Ref } from "react"
import Button from "./Button"
import type { ButtonVariant } from "./Button"

interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> {
  label: string
  icon: ReactNode
  variant?: ButtonVariant
  loading?: boolean
  ref?: Ref<HTMLButtonElement>
}

export default function IconButton({
  label,
  icon,
  variant = "ghost",
  loading = false,
  ref,
  ...rest
}: IconButtonProps) {
  return (
    <Button
      ref={ref}
      aria-label={label}
      title={label}
      variant={variant}
      size="icon"
      loading={loading}
      {...rest}
    >
      {icon}
    </Button>
  )
}

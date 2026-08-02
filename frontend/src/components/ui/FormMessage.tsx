import type { ReactNode } from "react"
import Alert from "./Alert"
import type { AlertVariant } from "./Alert"

interface FormMessageProps {
  variant?: AlertVariant
  children: ReactNode
}

export default function FormMessage({
  variant = "error",
  children,
}: FormMessageProps) {
  return <Alert variant={variant}>{children}</Alert>
}

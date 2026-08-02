import type { ReactNode } from "react"

export type AlertVariant = "success" | "error" | "warning" | "info"

interface AlertProps {
  variant?: AlertVariant
  title?: string
  action?: ReactNode
  className?: string
  children?: ReactNode
}

const VARIANTS: Record<AlertVariant, string> = {
  success: "border-success/30 bg-success-muted text-success-foreground",
  error: "border-danger/30 bg-danger-muted text-danger-foreground",
  warning: "border-warning/30 bg-warning-muted text-warning-foreground",
  info: "border-info/30 bg-info-muted text-info-foreground",
}

export default function Alert({
  variant = "info",
  title,
  action,
  className = "",
  children,
}: AlertProps) {
  const role = variant === "error" ? "alert" : "status"

  return (
    <div
      role={role}
      className={[
        "flex items-start justify-between gap-3 rounded-md border px-4 py-3 text-sm",
        VARIANTS[variant],
        className,
      ].join(" ")}
    >
      <div className="min-w-0">
        {title && <p className="font-medium">{title}</p>}
        {children && (
          <div className={title ? "mt-0.5" : undefined}>{children}</div>
        )}
      </div>
      {action}
    </div>
  )
}

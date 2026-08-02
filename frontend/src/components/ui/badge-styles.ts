import type { BadgeVariant } from "./status-labels"

export const BADGE_VARIANTS: Record<BadgeVariant, string> = {
  neutral: "border border-border bg-surface-muted text-foreground-muted",
  primary: "bg-primary-muted text-primary-foreground-muted",
  info: "bg-info-muted text-info-foreground",
  success: "bg-success-muted text-success-foreground",
  warning: "bg-warning-muted text-warning-foreground",
  danger: "bg-danger-muted text-danger-foreground",
  accent: "bg-violet-100 text-violet-800",
}

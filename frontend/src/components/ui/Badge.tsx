import type { ReactNode } from "react"
import type { BadgeVariant } from "./status-labels"
import { BADGE_VARIANTS } from "./badge-styles"

interface BadgeProps {
  variant?: BadgeVariant
  className?: string
  title?: string
  children: ReactNode
}

export type { BadgeVariant }

export default function Badge({
  variant = "neutral",
  className = "",
  title,
  children,
}: BadgeProps) {
  return (
    <span
      title={title}
      className={[
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium leading-5",
        BADGE_VARIANTS[variant],
        className,
      ].join(" ")}
    >
      {children}
    </span>
  )
}

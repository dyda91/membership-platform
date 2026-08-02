import type { ElementType, ReactNode } from "react"

export type CardVariant = "default" | "muted" | "interactive"

interface CardProps {
  variant?: CardVariant
  as?: ElementType
  className?: string
  children: ReactNode
}

const VARIANTS: Record<CardVariant, string> = {
  default: "border border-border bg-surface shadow-card",
  muted: "border border-border bg-surface-muted",
  interactive:
    "border border-border bg-surface shadow-card transition-shadow hover:shadow-overlay",
}

export default function Card({
  variant = "default",
  as = "div",
  className = "",
  children,
}: CardProps) {
  const Tag = as

  return (
    <Tag
      className={["rounded-lg", VARIANTS[variant], className].join(" ")}
    >
      {children}
    </Tag>
  )
}

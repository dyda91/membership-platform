import type { ReactNode } from "react"
import Card from "../ui/Card"

export type SummaryTone = "neutral" | "primary" | "success" | "warning" | "danger"

interface DashboardSummaryCardProps {
  label: string
  value: number | string
  description?: string
  tone?: SummaryTone
  action?: ReactNode
}

const TONES: Record<SummaryTone, string> = {
  neutral: "text-foreground",
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
}

export default function DashboardSummaryCard({
  label,
  value,
  description,
  tone = "neutral",
  action,
}: DashboardSummaryCardProps) {
  return (
    <Card className="p-4">
      <p className="text-sm font-medium text-foreground-muted">{label}</p>
      <p className={`mt-1 text-3xl font-bold tracking-tight ${TONES[tone]}`}>
        {value}
      </p>
      {description && (
        <p className="mt-1 text-xs text-foreground-muted">{description}</p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </Card>
  )
}

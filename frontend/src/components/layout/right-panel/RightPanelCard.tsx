import type { ReactNode } from "react"

import Card from "../../ui/Card"

interface RightPanelCardProps {
  title: string
  children: ReactNode
  action?: ReactNode
}

/**
 * Compact secondary card used inside the contextual right panel. Kept visually
 * quiet so it never competes with the main content column.
 */
export default function RightPanelCard({
  title,
  children,
  action,
}: RightPanelCardProps) {
  return (
    <Card variant="muted" className="p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {action}
      </div>
      <div className="mt-3 space-y-3 text-sm text-foreground-muted">
        {children}
      </div>
    </Card>
  )
}

import type { ReactNode } from "react"

interface PageHeaderProps {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
  level?: "h1" | "h2"
}

export default function PageHeader({
  title,
  description,
  actions,
  level = "h1",
}: PageHeaderProps) {
  const Heading = level

  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <Heading className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          {title}
        </Heading>
        {description && (
          <p className="mt-1.5 text-sm text-foreground-muted">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </header>
  )
}

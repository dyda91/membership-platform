import type { ReactNode } from "react"

interface PageSectionProps {
  title?: ReactNode
  description?: ReactNode
  actions?: ReactNode
  className?: string
  children: ReactNode
}

export default function PageSection({
  title,
  description,
  actions,
  className = "",
  children,
}: PageSectionProps) {
  return (
    <section className={["space-y-4", className].join(" ")}>
      {(title || actions) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            {title && (
              <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            )}
            {description && (
              <p className="mt-0.5 text-sm text-foreground-muted">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </section>
  )
}

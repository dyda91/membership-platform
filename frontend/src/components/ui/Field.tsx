import type { ReactNode } from "react"

interface FieldProps {
  id?: string
  label?: ReactNode
  help?: ReactNode
  error?: ReactNode
  className?: string
  children: ReactNode
}

export default function Field({
  id,
  label,
  help,
  error,
  className = "",
  children,
}: FieldProps) {
  const errorId = error ? `${id ?? "field"}-error` : undefined
  const helpId = help ? `${id ?? "field"}-help` : undefined

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p
          id={errorId}
          role="alert"
          className="mt-1.5 text-sm text-danger-foreground"
        >
          {error}
        </p>
      ) : help ? (
        <p id={helpId} className="mt-1.5 text-sm text-foreground-muted">
          {help}
        </p>
      ) : null}
    </div>
  )
}

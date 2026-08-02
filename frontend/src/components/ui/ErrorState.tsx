import Button from "./Button"

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

export default function ErrorState({
  title = "Não foi possível carregar este conteúdo.",
  description,
  onRetry,
  retryLabel = "Tentar novamente",
  className = "",
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={[
        "flex flex-col items-center justify-center rounded-lg border border-danger/30 bg-danger-muted/50 px-6 py-12 text-center",
        className,
      ].join(" ")}
    >
      <h3 className="text-base font-semibold text-danger-foreground">
        {title}
      </h3>
      {description && (
        <p className="mt-1 max-w-md text-sm text-danger-foreground/80">
          {description}
        </p>
      )}
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="mt-4">
          {retryLabel}
        </Button>
      )}
    </div>
  )
}

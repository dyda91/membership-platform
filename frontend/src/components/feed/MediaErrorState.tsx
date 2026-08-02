import Button from "../ui/Button"

interface MediaErrorStateProps {
  label?: string
  onRetry?: () => void
}

export default function MediaErrorState({
  label = "Não foi possível carregar a mídia.",
  onRetry,
}: MediaErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex h-full min-h-40 flex-col items-center justify-center gap-3 rounded-md border border-danger/30 bg-danger-muted/40 px-4 py-8 text-center"
    >
      <p className="text-sm text-danger-foreground">{label}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  )
}

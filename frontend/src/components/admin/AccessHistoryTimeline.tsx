import type { TierAccessHistoryEvent } from "../../services/tier-access"
import EmptyState from "../ui/EmptyState"
import Skeleton from "../ui/Skeleton"
import Alert from "../ui/Alert"
import Badge from "../ui/Badge"
import { ACCESS_ACTION_LABELS, ACCESS_ACTION_VARIANTS } from "./access-history-labels"

interface AccessHistoryTimelineProps {
  events: TierAccessHistoryEvent[] | null
  loading: boolean
  error?: string | null
  onRetry?: () => void
}

function formatDateTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return null
  }

  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString("pt-BR")
}

export default function AccessHistoryTimeline({
  events,
  loading,
  error,
  onRetry,
}: AccessHistoryTimelineProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert
        variant="error"
        action={
          onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="shrink-0 text-sm font-medium underline"
            >
              Tentar novamente
            </button>
          ) : undefined
        }
      >
        {error}
      </Alert>
    )
  }

  if (!events || events.length === 0) {
    return (
      <EmptyState
        className="border-0"
        title="Nenhum evento registrado"
        description="Alterações de acesso aparecerão aqui."
      />
    )
  }

  return (
    <ol className="space-y-3">
      {events.map((event) => (
        <li
          key={event.id}
          className="rounded-md border border-border bg-surface-muted/50 p-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge variant={ACCESS_ACTION_VARIANTS[event.action] ?? "neutral"}>
              {ACCESS_ACTION_LABELS[event.action] ?? event.action}
            </Badge>
            <time
              className="text-xs text-foreground-muted"
              title={event.createdAt}
            >
              {formatDateTime(event.createdAt)}
            </time>
          </div>

          <div className="mt-2 space-y-0.5 text-xs text-foreground-muted">
            {event.previousTier || event.newTier ? (
              <p>
                Tier:{" "}
                {event.previousTier?.name ?? "—"}
                {event.previousTier && event.newTier && " → "}
                {event.newTier?.name ?? ""}
              </p>
            ) : null}

            {formatDate(event.previousExpiresAt) ||
            formatDate(event.newExpiresAt) ? (
              <p>
                Expiração:{" "}
                {formatDate(event.previousExpiresAt) ?? "—"}
                {formatDate(event.previousExpiresAt) &&
                formatDate(event.newExpiresAt)
                  ? " → "
                  : ""}
                {formatDate(event.newExpiresAt) ?? "—"}
              </p>
            ) : null}

            {event.actor?.email && <p>Por {event.actor.email}</p>}
          </div>

          {event.internalNote && (
            <p className="mt-1 text-xs italic text-foreground-muted">
              Nota: {event.internalNote}
            </p>
          )}
        </li>
      ))}
    </ol>
  )
}

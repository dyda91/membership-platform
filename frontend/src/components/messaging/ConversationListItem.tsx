import type { ConversationSummary } from "../../services/messaging"
import Avatar from "../ui/Avatar"
import Badge from "../ui/Badge"
import { ACCESS_STATUS_LABELS } from "../ui/status-labels"

interface ConversationListItemProps {
  summary: ConversationSummary
  selected: boolean
  onSelect: () => void
}

function formatActivity(value: string | null) {
  if (!value) {
    return ""
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ""
  }

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  })
}

export default function ConversationListItem({
  summary,
  selected,
  onSelect,
}: ConversationListItemProps) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        aria-current={selected ? "true" : undefined}
        aria-label={`Conversa com ${summary.member.name ?? summary.member.email}`}
        className={[
          "flex w-full items-start gap-3 rounded-md border p-3 text-left transition-colors",
          selected
            ? "border-primary/40 bg-primary-muted"
            : "border-transparent hover:bg-surface-muted",
        ].join(" ")}
      >
        <Avatar
          url={null}
          name={summary.member.name}
          size="md"
          ariaLabel={summary.member.name ?? summary.member.email}
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-sm font-semibold text-foreground">
              {summary.member.name || "Membro"}
            </p>
            {summary.artistUnreadCount > 0 && (
              <span
                className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground"
                aria-label={`${summary.artistUnreadCount} mensagens não lidas`}
              >
                {summary.artistUnreadCount > 99
                  ? "99+"
                  : summary.artistUnreadCount}
              </span>
            )}
          </div>

          <p className="truncate text-xs text-foreground-muted">
            {summary.member.email}
          </p>

          <p className="mt-1 truncate text-sm text-foreground-muted">
            {summary.lastMessagePreview || "Sem mensagens ainda"}
          </p>

          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-foreground-muted">
            {summary.effectiveTier && (
              <Badge variant="primary">{summary.effectiveTier.name}</Badge>
            )}
            <span>
              {summary.effectiveTier
                ? ACCESS_STATUS_LABELS[summary.accessStatus] ??
                  summary.accessStatus
                : "Sem acesso ativo"}
            </span>
            {formatActivity(summary.lastMessageAt) && (
              <span aria-hidden="true">·</span>
            )}
            <time>{formatActivity(summary.lastMessageAt)}</time>
          </div>
        </div>
      </button>
    </li>
  )
}

import type { FeedContactAction, FeedTier } from "../../services/feed"
import ArtistContactActions from "../artist/ArtistContactActions"
import { IconTier } from "../ui/Icons"

interface LockedMediaProps {
  requiredTier?: FeedTier | null
  contactActions?: FeedContactAction[]
  ratio?: number
}

export default function LockedMedia({
  requiredTier,
  contactActions = [],
  ratio = 4 / 3,
}: LockedMediaProps) {
  return (
    <div
      style={{ aspectRatio: String(ratio) }}
      className="relative flex w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-md bg-surface-muted px-4 text-center"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-surface-muted to-background"
      />
      <div className="relative flex flex-col items-center gap-2 px-2 py-6">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-foreground-subtle shadow-card">
          <IconTier />
        </span>
        <p className="text-sm font-semibold text-foreground">
          Conteúdo exclusivo
        </p>

        {requiredTier && (
          <p className="text-sm text-foreground-muted">
            Disponível para o tier{" "}
            <span className="font-semibold text-foreground">
              {requiredTier.name}
            </span>
          </p>
        )}

        {contactActions.length > 0 ? (
          <ArtistContactActions actions={contactActions} />
        ) : (
          <p className="max-w-xs text-xs text-foreground-muted">
            Entre em contato para solicitar acesso ao conteúdo.
          </p>
        )}
      </div>
    </div>
  )
}

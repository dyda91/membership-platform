import type { FeedContactAction } from "../../services/artist-profile"
import ArtistContactActions from "../artist/ArtistContactActions"

interface LockedMediaProps {
  tierName?: string | null
  contactActions?: FeedContactAction[]
}

export default function LockedMedia({
  tierName,
  contactActions = [],
}: LockedMediaProps) {
  return (
    <div className="flex h-48 flex-col items-center justify-center rounded bg-gray-100 p-4 text-center">
      <span className="text-3xl" aria-hidden="true">
        🔒
      </span>

      <p className="mt-2 text-sm font-medium text-gray-700">
        Conteúdo exclusivo
      </p>

      {tierName && (
        <p className="mt-1 text-xs text-gray-500">
          Disponível para o tier {tierName}
        </p>
      )}

      {contactActions.length > 0 ? (
        <div className="mt-3">
          <ArtistContactActions actions={contactActions} />
        </div>
      ) : (
        <p className="mt-2 text-xs text-gray-500">
          Entre em contato para solicitar acesso.
        </p>
      )}
    </div>
  )
}

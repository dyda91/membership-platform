import type { FeedContactAction } from "../../services/artist-profile"

interface ArtistContactActionsProps {
  actions: FeedContactAction[]
}

export default function ArtistContactActions({
  actions,
}: ArtistContactActionsProps) {
  if (actions.length === 0) {
    return null
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {actions.map((action) => (
        <a
          key={action.type}
          href={action.url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
        >
          {action.label}
        </a>
      ))}
    </div>
  )
}

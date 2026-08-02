import type { FeedContactAction } from "../../services/feed"
import { buttonClasses } from "../ui/button-styles"

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
    <div className="mt-4 flex flex-wrap gap-2">
      {actions.map((action) => (
        <a
          key={action.type}
          href={action.url}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonClasses("secondary", "sm")}
        >
          {action.label}
        </a>
      ))}
    </div>
  )
}

import type { FeedAuthor } from "../../services/feed"
import Avatar from "../ui/Avatar"

interface PostHeaderProps {
  author: FeedAuthor
  createdAt: string
  /** Artist public name used when the post author has no stored name. */
  artistName?: string | null
  /** Artist profile photo used as the post author avatar. */
  artistAvatarUrl?: string | null
}

function formatDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ""
  }

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export default function PostHeader({
  author,
  createdAt,
  artistName,
  artistAvatarUrl,
}: PostHeaderProps) {
  const name = author.name ?? artistName ?? "Artista"

  return (
    <header className="flex items-center gap-2.5 px-4 pt-4 sm:px-6">
      <Avatar url={artistAvatarUrl} name={name} size="sm" ariaLabel={name} />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{name}</p>
        <time className="text-xs text-foreground-muted">
          {formatDate(createdAt)}
        </time>
      </div>
    </header>
  )
}

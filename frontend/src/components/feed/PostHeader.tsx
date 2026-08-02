import type { FeedAuthor } from "../../services/feed"
import Avatar from "../ui/Avatar"

interface PostHeaderProps {
  author: FeedAuthor
  createdAt: string
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

export default function PostHeader({ author, createdAt }: PostHeaderProps) {
  return (
    <header className="flex items-center gap-2.5 px-4 pt-4 sm:px-6">
      <Avatar
        url={null}
        name={author.name}
        size="sm"
        ariaLabel={author.name ?? "Autor"}
      />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">
          {author.name ?? "Artista"}
        </p>
        <time className="text-xs text-foreground-muted">
          {formatDate(createdAt)}
        </time>
      </div>
    </header>
  )
}

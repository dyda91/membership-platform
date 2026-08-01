import type { PostStatus } from "../../services/posts"

const STATUS_LABELS: Record<PostStatus, string> = {
  DRAFT: "Rascunho",
  PUBLISHED: "Publicado",
  ARCHIVED: "Arquivado",
}

const STATUS_STYLES: Record<PostStatus, string> = {
  DRAFT: "bg-yellow-100 text-yellow-700",
  PUBLISHED: "bg-green-100 text-green-700",
  ARCHIVED: "bg-gray-200 text-gray-700",
}

export default function DraftBadge({ status }: { status: PostStatus }) {
  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  )
}

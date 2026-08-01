import type { Post } from "../../services/posts"
import DraftBadge from "./DraftBadge"
import PostMediaGallery from "../feed/PostMediaGallery"
import type { FeedMedia } from "../../services/feed"

interface PostCardProps {
  post: Post
  onEdit?: (post: Post) => void
  onDelete?: (post: Post) => void
  onPublish?: (post: Post) => void
  onArchive?: (post: Post) => void
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR")
}

function toFeedMedia(post: Post): FeedMedia[] {
  return [...post.media]
    .sort((a, b) => a.position - b.position)
    .map((item) => ({
      id: item.id,
      type: item.type,
      mimeType: item.mimeType,
      size: item.size,
      width: item.width,
      height: item.height,
      duration: item.duration,
      position: item.position,
      locked: false,
      url: item.url,
    }))
}

export default function PostCard({
  post,
  onEdit,
  onDelete,
  onPublish,
  onArchive,
}: PostCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-900">
          {post.title ?? "Sem título"}
        </h3>

        <DraftBadge status={post.status} />
      </div>

      <p className="mt-2 text-sm text-gray-600">
        {post.content}
      </p>

      <PostMediaGallery
        media={toFeedMedia(post)}
        tierName={post.tier?.name}
      />

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
        <span>Criado em {formatDate(post.createdAt)}</span>

        {post.tier && (
          <span className="rounded bg-blue-100 px-2 py-1 font-medium text-blue-700">
            Tier: {post.tier.name}
          </span>
        )}

        <span>{post.media.length} mídia(s)</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(post)}
            className="rounded bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200"
          >
            Editar
          </button>
        )}

        {onPublish && post.status === "DRAFT" && (
          <button
            type="button"
            onClick={() => onPublish(post)}
            className="rounded bg-green-100 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-200"
          >
            Publicar
          </button>
        )}

        {onArchive && post.status !== "ARCHIVED" && (
          <button
            type="button"
            onClick={() => onArchive(post)}
            className="rounded bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-300"
          >
            Arquivar
          </button>
        )}

        {onDelete && (
          <button
            type="button"
            onClick={() => onDelete(post)}
            className="rounded bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
          >
            Excluir
          </button>
        )}
      </div>
    </div>
  )
}

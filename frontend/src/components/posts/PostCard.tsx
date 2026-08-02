import type { Post } from "../../services/posts"
import DraftBadge from "./DraftBadge"
import PostMediaGallery from "../feed/PostMediaGallery"
import type { FeedMedia } from "../../services/feed"
import Card from "../ui/Card"
import Badge from "../ui/Badge"
import Button from "../ui/Button"

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
    <Card className="p-6">
      <div className="flex items-center justify-between gap-4">
        <h3 className="min-w-0 truncate text-lg font-semibold text-foreground">
          {post.title ?? "Sem título"}
        </h3>

        <DraftBadge status={post.status} />
      </div>

      <p className="mt-2 whitespace-pre-wrap text-sm text-foreground-muted">
        {post.content}
      </p>

      <PostMediaGallery
        media={toFeedMedia(post)}
        tierName={post.tier?.name}
      />

      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-foreground-muted">
        <span>Criado em {formatDate(post.createdAt)}</span>

        {post.tier && (
          <Badge variant="primary">Tier: {post.tier.name}</Badge>
        )}

        <span>{post.media.length} mídia(s)</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {onEdit && (
          <Button variant="outline" size="sm" onClick={() => onEdit(post)}>
            Editar
          </Button>
        )}

        {onPublish && post.status === "DRAFT" && (
          <Button variant="secondary" size="sm" onClick={() => onPublish(post)}>
            Publicar
          </Button>
        )}

        {onArchive && post.status !== "ARCHIVED" && (
          <Button variant="ghost" size="sm" onClick={() => onArchive(post)}>
            Arquivar
          </Button>
        )}

        {onDelete && (
          <Button variant="danger" size="sm" onClick={() => onDelete(post)}>
            Excluir
          </Button>
        )}
      </div>
    </Card>
  )
}

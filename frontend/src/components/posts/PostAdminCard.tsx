import type { Post } from "../../services/posts"
import Card from "../ui/Card"
import Button from "../ui/Button"
import Badge from "../ui/Badge"
import { postStatusVariant, POST_STATUS_LABELS } from "../ui/status-labels"
import { IconPosts } from "../ui/Icons"

interface PostAdminCardProps {
  post: Post
  disabled?: boolean
  onEdit: (post: Post) => void
  onPublish: (post: Post) => void
  onArchive: (post: Post) => void
  onDelete: (post: Post) => void
  onOpenFeed?: (post: Post) => void
}

function formatDate(value: string) {
  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("pt-BR")
}

function firstMedia(post: Post) {
  return [...post.media].sort((a, b) => a.position - b.position)[0]
}

export default function PostAdminCard({
  post,
  disabled = false,
  onEdit,
  onPublish,
  onArchive,
  onDelete,
  onOpenFeed,
}: PostAdminCardProps) {
  const preview = firstMedia(post)

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start gap-4">
        <div className="w-24 shrink-0 sm:w-32">
          {preview ? (
            preview.type === "IMAGE" ? (
              <img
                src={preview.url}
                alt=""
                className="h-20 w-24 rounded-md object-cover sm:h-24 sm:w-32"
              />
            ) : (
              <div className="flex h-20 w-24 items-center justify-center rounded-md bg-surface-muted text-foreground-subtle sm:h-24 sm:w-32">
                <IconPosts />
              </div>
            )
          ) : (
            <div className="flex h-20 w-24 items-center justify-center rounded-md bg-surface-muted text-xs text-foreground-muted sm:h-24 sm:w-32">
              Sem mídia
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={postStatusVariant(post.status)}>
              {POST_STATUS_LABELS[post.status]}
            </Badge>
            {post.tier && (
              <Badge variant="primary">Tier: {post.tier.name}</Badge>
            )}
            <span className="text-xs text-foreground-muted">
              {post.media.length} mídia(s)
            </span>
          </div>

          <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm text-foreground">
            {post.content}
          </p>

          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground-muted">
            <span>Criado em {formatDate(post.createdAt)}</span>
            <span>Atualizado em {formatDate(post.updatedAt)}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(post)} disabled={disabled}>
          Editar
        </Button>

        {post.status === "DRAFT" && (
          <Button variant="secondary" size="sm" onClick={() => onPublish(post)} disabled={disabled}>
            Publicar
          </Button>
        )}

        {post.status === "ARCHIVED" && (
          <Button variant="secondary" size="sm" onClick={() => onPublish(post)} disabled={disabled}>
            Restaurar
          </Button>
        )}

        {post.status !== "ARCHIVED" && (
          <Button variant="ghost" size="sm" onClick={() => onArchive(post)} disabled={disabled}>
            Arquivar
          </Button>
        )}

        {post.status === "PUBLISHED" && onOpenFeed && (
          <Button variant="ghost" size="sm" onClick={() => onOpenFeed(post)} disabled={disabled}>
            Ver no Feed
          </Button>
        )}

        <Button variant="danger" size="sm" onClick={() => onDelete(post)} disabled={disabled}>
          Excluir
        </Button>
      </div>
    </Card>
  )
}

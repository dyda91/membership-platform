import type { Media } from "../../services/media"

interface MediaPreviewProps {
  media: Media
  compact?: boolean
}

export default function MediaPreview({ media, compact = false }: MediaPreviewProps) {
  if (media.type === "IMAGE") {
    return (
      <img
        src={media.url}
        alt={media.originalName}
        className={compact ? "h-full w-full object-cover" : "max-h-64 w-full rounded object-cover"}
      />
    )
  }

  if (compact) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-surface-muted text-xs text-foreground-muted">
        Vídeo
      </div>
    )
  }

  return (
    <video controls className="max-h-64 w-full rounded">
      <source src={media.url} type={media.mimeType} />
      Seu navegador não suporta vídeos.
    </video>
  )
}

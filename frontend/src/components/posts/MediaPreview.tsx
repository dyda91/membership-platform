import type { Media } from "../../services/media"

export default function MediaPreview({ media }: { media: Media }) {
  if (media.type === "IMAGE") {
    return (
      <img
        src={media.url}
        alt={media.originalName}
        className="max-h-64 w-full rounded object-cover"
      />
    )
  }

  return (
    <video controls className="max-h-64 w-full rounded">
      <source src={media.url} type={media.mimeType} />
      Seu navegador não suporta vídeos.
    </video>
  )
}

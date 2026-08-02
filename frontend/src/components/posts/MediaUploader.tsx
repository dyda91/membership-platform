import { useState } from "react"
import { deleteMedia, uploadMedia } from "../../services/media"
import type { Media } from "../../services/media"
import MediaPreview from "./MediaPreview"
import Button from "../ui/Button"
import Alert from "../ui/Alert"

interface MediaUploaderProps {
  postId?: string
  media: Media[]
  onChange: (media: Media[]) => void
}

export default function MediaUploader({
  postId,
  media,
  onChange,
}: MediaUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleUpload(file: File | undefined) {
    if (!file) {
      return
    }

    setUploading(true)
    setError(null)

    try {
      const uploaded = await uploadMedia(file, postId)
      onChange([...media, uploaded])
    } catch {
      setError("Não foi possível enviar o arquivo. Verifique o tipo e o tamanho.")
    } finally {
      setUploading(false)
    }
  }

  async function handleRemove(item: Media) {
    try {
      await deleteMedia(item.id)
      onChange(media.filter((m) => m.id !== item.id))
    } catch {
      setError("Não foi possível remover a mídia.")
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">
        Mídias
      </label>

      <div className="mt-2 grid gap-4 sm:grid-cols-2">
        {media.map((item) => (
          <div key={item.id} className="rounded-md border border-border p-2">
            <MediaPreview media={item} />

            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="truncate text-xs text-foreground-muted">
                {item.originalName}
              </span>
              <Button
                variant="danger"
                size="sm"
                onClick={() => void handleRemove(item)}
              >
                Remover
              </Button>
            </div>
          </div>
        ))}
      </div>

      <input
        type="file"
        accept="image/*,video/*"
        onChange={(event) => void handleUpload(event.target.files?.[0])}
        className="mt-4 block w-full text-sm text-foreground-subtle file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary-hover"
      />

      {uploading && (
        <p className="mt-2 text-sm text-foreground-muted">Enviando arquivo...</p>
      )}

      {error && <div className="mt-2"><Alert variant="error">{error}</Alert></div>}
    </div>
  )
}

import { useState } from "react"
import { deleteMedia, uploadMedia } from "../../services/media"
import type { Media } from "../../services/media"
import MediaPreview from "./MediaPreview"

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
      <label className="block text-sm font-medium text-gray-700">
        Mídias
      </label>

      <div className="mt-2 grid gap-4 sm:grid-cols-2">
        {media.map((item) => (
          <div
            key={item.id}
            className="rounded border border-gray-200 p-2"
          >
            <MediaPreview media={item} />

            <div className="mt-2 flex items-center justify-between">
              <span className="truncate text-xs text-gray-500">
                {item.originalName}
              </span>
              <button
                type="button"
                onClick={() => void handleRemove(item)}
                className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
              >
                Remover
              </button>
            </div>
          </div>
        ))}
      </div>

      <input
        type="file"
        accept="image/*,video/*"
        onChange={(event) => void handleUpload(event.target.files?.[0])}
        className="mt-4 block w-full text-sm text-gray-500 file:mr-3 file:rounded file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-blue-700"
      />

      {uploading && (
        <p className="mt-2 text-sm text-gray-600">Enviando arquivo...</p>
      )}

      {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  )
}

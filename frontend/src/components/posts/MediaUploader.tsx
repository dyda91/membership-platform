import { useState } from "react"

import { deleteMedia, reorderMedia, uploadMedia } from "../../services/media"
import type { Media } from "../../services/media"
import MediaPreview from "./MediaPreview"
import Button from "../ui/Button"
import Badge from "../ui/Badge"
import Alert from "../ui/Alert"
import Spinner from "../ui/Spinner"
import IconButton from "../ui/IconButton"
import { IconChevronLeft, IconChevronRight } from "../ui/Icons"

interface MediaUploaderProps {
  postId?: string
  media: Media[]
  onChange: (media: Media[]) => void
}

interface QueueItem {
  key: string
  file: File
  status: "processing" | "error"
  previewUrl?: string
}

function createObjectUrl(file: File): string | undefined {
  if (file.type.startsWith("image/")) {
    try {
      return URL.createObjectURL(file)
    } catch {
      return undefined
    }
  }

  return undefined
}

export default function MediaUploader({
  postId,
  media,
  onChange,
}: MediaUploaderProps) {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [error, setError] = useState<string | null>(null)

  async function handleUpload(file: File | undefined) {
    if (!file) {
      return
    }

    const item: QueueItem = {
      key: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      status: "processing",
      previewUrl: createObjectUrl(file),
    }

    setQueue((current) => [...current, item])
    setError(null)

    try {
      const uploaded = await uploadMedia(file, postId)
      onChange([...media, uploaded])
      setQueue((current) => current.filter((entry) => entry.key !== item.key))
    } catch {
      setQueue((current) =>
        current.map((entry) =>
          entry.key === item.key
            ? { ...entry, status: "error" as const }
            : entry,
        ),
      )
    }
  }

  async function handleRetry(item: QueueItem) {
    setQueue((current) =>
      current.map((entry) =>
        entry.key === item.key
          ? { ...entry, status: "processing" as const }
          : entry,
      ),
    )
    setError(null)

    try {
      const uploaded = await uploadMedia(item.file, postId)
      onChange([...media, uploaded])
      setQueue((current) => current.filter((entry) => entry.key !== item.key))
    } catch {
      setQueue((current) =>
        current.map((entry) =>
          entry.key === item.key
            ? { ...entry, status: "error" as const }
            : entry,
        ),
      )
    }
  }

  async function handleRemove(item: Media) {
    setError(null)

    try {
      if (item.id) {
        await deleteMedia(item.id)
      }

      onChange(media.filter((entry) => entry.id !== item.id))
    } catch {
      setError("Não foi possível remover a mídia.")
    }
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const target = index + direction

    if (target < 0 || target >= media.length) {
      return
    }

    const next = [...media]
    ;[next[index], next[target]] = [next[target], next[index]]
    setError(null)

    const canPersist = Boolean(postId) && next.every((item) => item.postId === postId)

    if (canPersist && postId) {
      try {
        const result = await reorderMedia(
          postId,
          next.map((item) => item.id),
        )
        onChange(result)
      } catch {
        setError("Não foi possível salvar a nova ordem da mídia.")
      }
    } else {
      onChange(next)
    }
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">
        Mídias
      </label>

      {media.length > 0 && (
        <ul className="space-y-2">
          {media.map((item, index) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center gap-3 rounded-md border border-border p-2"
            >
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md">
                <MediaPreview media={item} compact />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm text-foreground">
                    {item.originalName}
                  </span>
                  {index === 0 && (
                    <Badge variant="primary">Principal</Badge>
                  )}
                </div>
                <span className="text-xs text-foreground-muted">
                  {item.type === "VIDEO" ? "Vídeo" : "Imagem"}
                </span>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                {media.length > 1 && (
                  <>
                    <IconButton
                      label="Mover para cima"
                      variant="ghost"
                      icon={<IconChevronLeft />}
                      onClick={() => void handleMove(index, -1)}
                      disabled={index === 0}
                    />
                    <IconButton
                      label="Mover para baixo"
                      variant="ghost"
                      icon={<IconChevronRight />}
                      onClick={() => void handleMove(index, 1)}
                      disabled={index === media.length - 1}
                    />
                  </>
                )}
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => void handleRemove(item)}
                >
                  Remover
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {queue.length > 0 && (
        <ul className="mt-3 space-y-2">
          {queue.map((item) => (
            <li
              key={item.key}
              className="flex flex-wrap items-center gap-3 rounded-md border border-border p-2"
            >
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-surface-muted">
                {item.previewUrl ? (
                  <img
                    src={item.previewUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-foreground-muted">
                    {item.file.type.startsWith("video/") ? "Vídeo" : "Arquivo"}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-foreground">
                  {item.file.name}
                </p>
                {item.status === "processing" ? (
                  <p className="flex items-center gap-1.5 text-xs text-foreground-muted">
                    <Spinner size="sm" />
                    Enviando
                  </p>
                ) : (
                  <p className="text-xs text-danger-foreground">
                    Não foi possível enviar.
                  </p>
                )}
              </div>

              {item.status === "error" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void handleRetry(item)}
                >
                  Tentar novamente
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      <input
        type="file"
        accept="image/*,video/*"
        onChange={(event) => void handleUpload(event.target.files?.[0])}
        className="mt-4 block w-full text-sm text-foreground-subtle file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-primary-hover"
      />

      {error && (
        <div className="mt-2">
          <Alert variant="error">{error}</Alert>
        </div>
      )}
    </div>
  )
}

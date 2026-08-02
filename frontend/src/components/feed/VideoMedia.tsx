import { useCallback, useEffect, useState } from "react"
import { aspectRatioOf, VIDEO_FALLBACK_RATIO } from "../../services/feed"
import type { FeedMedia } from "../../services/feed"
import MediaErrorState from "./MediaErrorState"

interface VideoMediaProps {
  item: FeedMedia
}

export default function VideoMedia({ item }: VideoMediaProps) {
  const [error, setError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)

  useEffect(() => {
    setError(false)
  }, [item.url, retryKey])

  const handleRetry = useCallback(() => {
    setRetryKey((current) => current + 1)
  }, [])

  if (error || !item.url) {
    return <MediaErrorState onRetry={handleRetry} />
  }

  const ratio = aspectRatioOf(item.type, item.width, item.height)

  return (
    <div
      style={{
        aspectRatio: String(ratio || VIDEO_FALLBACK_RATIO),
        maxHeight: "min(76vh, 640px)",
      }}
      className="relative w-full overflow-hidden bg-surface-muted"
    >
      <video
        key={`${item.id}-${retryKey}`}
        controls
        playsInline
        preload="metadata"
        onError={() => setError(true)}
        className="h-full w-full object-contain"
      >
        <source src={item.url} type={item.mimeType} />
        Seu navegador não suporta vídeos.
      </video>
    </div>
  )
}

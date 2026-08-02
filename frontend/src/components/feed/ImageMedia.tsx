import { useCallback, useEffect, useState } from "react"
import { aspectRatioOf, IMAGE_FALLBACK_RATIO } from "../../services/feed"
import type { FeedMedia } from "../../services/feed"
import MediaErrorState from "./MediaErrorState"

interface ImageMediaProps {
  item: FeedMedia
  onClick?: () => void
  eager?: boolean
  alt?: string
}

export default function ImageMedia({
  item,
  onClick,
  eager = false,
  alt = "",
}: ImageMediaProps) {
  const [error, setError] = useState(false)
  const [retryKey, setRetryKey] = useState(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setError(false)
    setLoaded(false)
  }, [item.url, retryKey])

  const handleRetry = useCallback(() => {
    setRetryKey((current) => current + 1)
  }, [])

  if (error || !item.url) {
    return <MediaErrorState onRetry={handleRetry} />
  }

  const ratio = aspectRatioOf(item.type, item.width, item.height)

  const image = (
    <img
      key={`${item.id}-${retryKey}`}
      src={item.url}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setError(true)}
      onLoad={() => setLoaded(true)}
      className={[
        "h-full w-full object-contain transition-opacity duration-200",
        loaded ? "opacity-100" : "opacity-0",
      ].join(" ")}
    />
  )

  const content = (
    <div
      style={{
        aspectRatio: String(ratio || IMAGE_FALLBACK_RATIO),
        maxHeight: "min(72vh, 640px)",
      }}
      className="relative w-full overflow-hidden bg-surface-muted"
    >
      {image}
    </div>
  )

  if (!onClick) {
    return content
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Ampliar imagem"
      className="block w-full cursor-zoom-in text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
    >
      {content}
    </button>
  )
}

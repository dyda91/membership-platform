import { useState } from "react"
import MediaErrorState from "./MediaErrorState"

interface VideoMediaProps {
  src: string
  mimeType?: string
  poster?: string
}

export default function VideoMedia({ src, mimeType, poster }: VideoMediaProps) {
  const [error, setError] = useState(false)

  if (error || !src) {
    return <MediaErrorState />
  }

  return (
    <video
      controls
      preload="metadata"
      poster={poster}
      onError={() => setError(true)}
      className="max-h-96 w-full rounded"
    >
      <source src={src} type={mimeType} />
      Seu navegador não suporta vídeos.
    </video>
  )
}

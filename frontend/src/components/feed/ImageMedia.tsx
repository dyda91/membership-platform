import { useState } from "react"
import MediaErrorState from "./MediaErrorState"

interface ImageMediaProps {
  src: string
  alt?: string
}

export default function ImageMedia({ src, alt }: ImageMediaProps) {
  const [error, setError] = useState(false)

  if (error || !src) {
    return <MediaErrorState />
  }

  return (
    <img
      src={src}
      alt={alt ?? ""}
      onError={() => setError(true)}
      className="max-h-96 w-full rounded object-cover"
    />
  )
}

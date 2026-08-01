import { useState } from "react"

interface ArtistBannerProps {
  url: string | null
}

export default function ArtistBanner({ url }: ArtistBannerProps) {
  const [error, setError] = useState(false)

  if (!url || error) {
    return <div className="h-40 w-full rounded-t-lg bg-gray-200" />
  }

  return (
    <img
      src={url}
      alt="Banner da artista"
      onError={() => setError(true)}
      className="h-40 w-full rounded-t-lg object-cover"
    />
  )
}

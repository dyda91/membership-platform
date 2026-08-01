import { useState } from "react"

interface ArtistAvatarProps {
  url: string | null
  name: string | null
}

export default function ArtistAvatar({ url, name }: ArtistAvatarProps) {
  const [error, setError] = useState(false)

  if (!url || error) {
    return (
      <div
        aria-label="Avatar"
        className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 text-3xl font-bold text-gray-500"
      >
        {(name ?? "A").charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <img
      src={url}
      alt={name ?? "Avatar"}
      onError={() => setError(true)}
      className="h-24 w-24 rounded-full object-cover"
    />
  )
}

import { useState } from "react"

export type AvatarSize = "sm" | "md" | "lg" | "xl"

interface AvatarProps {
  url?: string | null
  name?: string | null
  size?: AvatarSize
  ariaLabel?: string
  className?: string
}

const SIZES: Record<AvatarSize, string> = {
  sm: "h-8 w-8 text-sm",
  md: "h-10 w-10 text-base",
  lg: "h-24 w-24 text-3xl",
  xl: "h-20 w-20 text-2xl sm:h-28 sm:w-28 sm:text-3xl",
}

export default function Avatar({
  url,
  name,
  size = "md",
  ariaLabel = "Avatar",
  className = "",
}: AvatarProps) {
  const [error, setError] = useState(false)

  if (!url || error) {
    return (
      <div
        aria-label={ariaLabel}
        role="img"
        className={[
          "flex shrink-0 items-center justify-center rounded-full bg-surface-muted font-bold text-foreground-muted",
          SIZES[size],
          className,
        ].join(" ")}
      >
        {(name ?? "A").charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <img
      src={url}
      alt={name ?? ariaLabel}
      onError={() => setError(true)}
      className={[
        "shrink-0 rounded-full object-cover",
        SIZES[size],
        className,
      ].join(" ")}
    />
  )
}

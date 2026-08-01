import type { FeedMedia } from "../../services/feed"
import type { FeedContactAction } from "../../services/artist-profile"
import ImageMedia from "./ImageMedia"
import VideoMedia from "./VideoMedia"
import LockedMedia from "./LockedMedia"

interface PostMediaGalleryProps {
  media: FeedMedia[]
  tierName?: string | null
  contactActions?: FeedContactAction[]
}

/**
 * Renders ordered post media. The first ordered item is the primary preview.
 * Locked media is never given a URL.
 */
export default function PostMediaGallery({
  media,
  tierName,
  contactActions = [],
}: PostMediaGalleryProps) {
  if (media.length === 0) {
    return null
  }

  const ordered = [...media].sort((a, b) => a.position - b.position)

  return (
    <div className="mt-4 space-y-4">
      {ordered.map((item) => {
        if (item.locked || !item.url) {
          return (
            <LockedMedia
              key={item.id}
              tierName={tierName}
              contactActions={contactActions}
            />
          )
        }

        if (item.type === "VIDEO") {
          return (
            <VideoMedia key={item.id} src={item.url} mimeType={item.mimeType} />
          )
        }

        return <ImageMedia key={item.id} src={item.url} />
      })}
    </div>
  )
}

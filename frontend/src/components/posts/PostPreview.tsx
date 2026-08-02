import type { FeedMedia, FeedTier } from "../../services/feed"
import type { Media } from "../../services/media"
import PostHeader from "../feed/PostHeader"
import PostText from "../feed/PostText"
import PostMediaGallery from "../feed/PostMediaGallery"
import Badge from "../ui/Badge"

interface PostPreviewProps {
  content: string
  media: Media[]
  requiredTier?: FeedTier | null
}

function toFeedMedia(items: Media[]): FeedMedia[] {
  return items.map((item) => ({
    id: item.id,
    type: item.type,
    mimeType: item.mimeType,
    size: item.size,
    width: item.width,
    height: item.height,
    duration: item.duration,
    position: item.position,
    locked: false,
    url: item.url,
  }))
}

export default function PostPreview({
  content,
  media,
  requiredTier,
}: PostPreviewProps) {
  return (
    <article className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
      <PostHeader
        author={{ id: "preview", name: "Você" }}
        createdAt={new Date().toISOString()}
      />

      {requiredTier && (
        <div className="px-4 pt-3 sm:px-6">
          <Badge variant="primary">Tier: {requiredTier.name}</Badge>
        </div>
      )}

      <div className="px-4 py-3 sm:px-6">
        <PostText content={content} />
      </div>

      {media.length > 0 && (
        <PostMediaGallery media={toFeedMedia(media)} requiredTier={requiredTier} />
      )}
    </article>
  )
}

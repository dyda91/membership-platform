import type { FeedPost } from "../../services/feed"
import type { FeedContactAction } from "../../services/artist-profile"
import FeedPostCard from "./FeedPostCard"
import EmptyState from "../ui/EmptyState"
import { IconInbox } from "../ui/Icons"

interface FeedListProps {
  posts: FeedPost[]
  contactActions?: FeedContactAction[]
  artistName?: string | null
  artistAvatarUrl?: string | null
}

export default function FeedList({
  posts,
  contactActions = [],
  artistName,
  artistAvatarUrl,
}: FeedListProps) {
  if (posts.length === 0) {
    return (
      <EmptyState
        icon={<IconInbox />}
        title="Nenhum post publicado ainda"
        description="Assim que a artista publicar conteúdo, ele aparecerá aqui."
      />
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <FeedPostCard
          key={post.id}
          post={post}
          contactActions={contactActions}
          artistName={artistName}
          artistAvatarUrl={artistAvatarUrl}
        />
      ))}
    </div>
  )
}

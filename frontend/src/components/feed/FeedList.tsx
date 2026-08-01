import type { FeedPost } from "../../services/feed"
import type { FeedContactAction } from "../../services/artist-profile"
import FeedPostCard from "./FeedPostCard"

interface FeedListProps {
  posts: FeedPost[]
  contactActions?: FeedContactAction[]
}

export default function FeedList({
  posts,
  contactActions = [],
}: FeedListProps) {
  if (posts.length === 0) {
    return (
      <p className="text-gray-600">
        Nenhum post publicado ainda.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <FeedPostCard
          key={post.id}
          post={post}
          contactActions={contactActions}
        />
      ))}
    </div>
  )
}

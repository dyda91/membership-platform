import { memo } from "react"
import { Link } from "react-router-dom"

import type { FeedContactAction, FeedPost } from "../../services/feed"
import { useAuth } from "../../contexts/AuthContext"
import PostHeader from "./PostHeader"
import PostText from "./PostText"
import PostMediaGallery from "./PostMediaGallery"
import { buttonClasses } from "../ui/button-styles"

interface FeedPostCardProps {
  post: FeedPost
  contactActions?: FeedContactAction[]
  artistName?: string | null
  artistAvatarUrl?: string | null
}

function FeedPostCard({
  post,
  contactActions = [],
  artistName,
  artistAvatarUrl,
}: FeedPostCardProps) {
  const { canManageContent } = useAuth()

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
      <div className="flex items-start justify-between gap-2">
        <PostHeader
          author={post.author}
          createdAt={post.createdAt}
          artistName={artistName}
          artistAvatarUrl={artistAvatarUrl}
        />

        {canManageContent && (
          <Link
            to={`/posts/${post.id}/edit`}
            className={buttonClasses("ghost", "sm", "mr-2 mt-3")}
          >
            Editar
          </Link>
        )}
      </div>

      <div className="px-4 py-3 sm:px-6">
        <PostText content={post.content} />
      </div>

      {post.media.length > 0 && (
        <PostMediaGallery
          media={post.media}
          requiredTier={post.requiredTier}
          contactActions={contactActions}
        />
      )}
    </article>
  )
}

export default memo(FeedPostCard)

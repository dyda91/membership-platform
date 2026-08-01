import type { FeedPost } from "../../services/feed"
import PostMediaGallery from "./PostMediaGallery"

interface FeedPostCardProps {
  post: FeedPost
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR")
}

export default function FeedPostCard({ post }: FeedPostCardProps) {
  return (
    <article className="rounded-lg border border-gray-200 bg-white p-6 shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">
            {post.author.name ?? "Autor"}
          </span>

          {post.requiredTier && (
            <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
              {post.requiredTier.name}
            </span>
          )}
        </div>

        <time className="text-xs text-gray-500">
          {formatDate(post.createdAt)}
        </time>
      </div>

      <p className="mt-3 whitespace-pre-wrap text-gray-800">{post.content}</p>

      <PostMediaGallery
        media={post.media}
        tierName={post.requiredTier?.name}
      />
    </article>
  )
}

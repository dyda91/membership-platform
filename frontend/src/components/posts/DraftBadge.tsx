import Badge from "../ui/Badge"
import { postStatusVariant, POST_STATUS_LABELS } from "../ui/status-labels"
import type { PostStatus } from "../../services/posts"

export default function DraftBadge({ status }: { status: PostStatus }) {
  return (
    <Badge variant={postStatusVariant(status)}>
      {POST_STATUS_LABELS[status]}
    </Badge>
  )
}

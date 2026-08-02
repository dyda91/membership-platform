import type { FeedTier } from "../../services/feed"
import type { Media } from "../../services/media"
import Dialog from "../ui/Dialog"
import PostPreview from "./PostPreview"

interface PostPreviewDialogProps {
  open: boolean
  onClose: () => void
  content: string
  media: Media[]
  requiredTier?: FeedTier | null
}

export default function PostPreviewDialog({
  open,
  onClose,
  content,
  media,
  requiredTier,
}: PostPreviewDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Prévia do post"
      description="Como o post aparecerá no Feed público."
      size="lg"
    >
      <PostPreview content={content} media={media} requiredTier={requiredTier} />
    </Dialog>
  )
}

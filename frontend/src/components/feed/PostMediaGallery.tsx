import { useCallback, useMemo, useState } from "react"
import type { KeyboardEvent, TouchEvent } from "react"

import type {
  FeedContactAction,
  FeedMedia,
  FeedTier,
} from "../../services/feed"
import { aspectRatioOf, mediaAuthorized } from "../../services/feed"
import ImageMedia from "./ImageMedia"
import VideoMedia from "./VideoMedia"
import LockedMedia from "./LockedMedia"
import ImageLightbox from "./ImageLightbox"
import IconButton from "../ui/IconButton"
import { IconChevronLeft, IconChevronRight } from "../ui/Icons"

interface PostMediaGalleryProps {
  media: FeedMedia[]
  requiredTier?: FeedTier | null
  contactActions?: FeedContactAction[]
}

const SWIPE_THRESHOLD = 40

export default function PostMediaGallery({
  media,
  requiredTier,
  contactActions = [],
}: PostMediaGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const ordered = useMemo(
    () => [...media].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
    [media],
  )

  const images = useMemo(
    () => ordered.filter((item) => mediaAuthorized(item) && item.type === "IMAGE"),
    [ordered],
  )

  const goTo = useCallback(
    (index: number) => {
      if (ordered.length === 0) {
        return
      }

      setActiveIndex(((index % ordered.length) + ordered.length) % ordered.length)
    },
    [ordered.length],
  )

  if (ordered.length === 0) {
    return null
  }

  const clampedIndex = Math.min(activeIndex, ordered.length - 1)
  const active = ordered[clampedIndex]
  const multiple = ordered.length > 1

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault()
      goTo(clampedIndex - 1)
    } else if (event.key === "ArrowRight") {
      event.preventDefault()
      goTo(clampedIndex + 1)
    }
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    setTouchStartX(event.touches[0]?.clientX ?? null)
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (touchStartX === null) {
      return
    }

    const endX = event.changedTouches[0]?.clientX ?? touchStartX
    const delta = endX - touchStartX

    if (Math.abs(delta) >= SWIPE_THRESHOLD) {
      if (delta > 0) {
        goTo(clampedIndex - 1)
      } else {
        goTo(clampedIndex + 1)
      }
    }

    setTouchStartX(null)
  }

  function openLightbox() {
    if (!mediaAuthorized(active) || active.type !== "IMAGE") {
      return
    }

    const imageIndex = images.findIndex((item) => item.id === active.id)

    if (imageIndex >= 0) {
      setLightboxIndex(imageIndex)
    }
  }

  const mediaRegion =
    mediaAuthorized(active) && !active.locked ? (
      active.type === "VIDEO" ? (
        <VideoMedia item={active} />
      ) : (
        <ImageMedia item={active} onClick={openLightbox} />
      )
    ) : (
      <LockedMedia
        requiredTier={requiredTier}
        contactActions={contactActions}
        ratio={aspectRatioOf(active.type, active.width, active.height)}
      />
    )

  return (
    <div
      role="group"
      aria-roledescription="galeria"
      aria-label={`Mídia ${clampedIndex + 1} de ${ordered.length}`}
      tabIndex={multiple ? 0 : undefined}
      onKeyDown={multiple ? handleKeyDown : undefined}
      onTouchStart={multiple ? handleTouchStart : undefined}
      onTouchEnd={multiple ? handleTouchEnd : undefined}
      className="relative"
    >
      {mediaRegion}

      {multiple && (
        <>
          <div className="absolute inset-y-0 left-2 flex items-center">
            <IconButton
              label="Mídia anterior"
              variant="ghost"
              icon={<IconChevronLeft />}
              onClick={() => goTo(clampedIndex - 1)}
              className="bg-surface/80 shadow-card"
            />
          </div>
          <div className="absolute inset-y-0 right-2 flex items-center">
            <IconButton
              label="Próxima mídia"
              variant="ghost"
              icon={<IconChevronRight />}
              onClick={() => goTo(clampedIndex + 1)}
              className="bg-surface/80 shadow-card"
            />
          </div>
          <div className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
            {clampedIndex + 1} / {ordered.length}
          </div>
        </>
      )}

      {lightboxIndex !== null && images.length > 0 && (
        <ImageLightbox
          images={images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </div>
  )
}

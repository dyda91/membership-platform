import { useEffect, useState } from "react"

import type { FeedMedia } from "../../services/feed"
import Dialog from "../ui/Dialog"
import IconButton from "../ui/IconButton"
import { IconChevronLeft, IconChevronRight } from "../ui/Icons"

interface ImageLightboxProps {
  images: FeedMedia[]
  initialIndex: number
  onClose: () => void
}

export default function ImageLightbox({
  images,
  initialIndex,
  onClose,
}: ImageLightboxProps) {
  const [index, setIndex] = useState(
    Math.min(initialIndex, Math.max(0, images.length - 1)),
  )

  const count = images.length

  const goTo = (next: number) => {
    setIndex(((next % count) + count) % count)
  }

  useEffect(() => {
    function handleKey(event: globalThis.KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        setIndex((current) => (current - 1 + count) % count)
      } else if (event.key === "ArrowRight") {
        setIndex((current) => (current + 1) % count)
      }
    }

    window.addEventListener("keydown", handleKey)

    return () => {
      window.removeEventListener("keydown", handleKey)
    }
  }, [count])

  if (count === 0) {
    return null
  }

  const active = images[index]

  return (
    <Dialog
      open
      onClose={onClose}
      title={`Imagem ${index + 1} de ${count}`}
      size="lg"
      closeOnBackdrop
      footer={
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <IconButton
              label="Imagem anterior"
              variant="outline"
              icon={<IconChevronLeft />}
              onClick={() => goTo(index - 1)}
              disabled={count <= 1}
            />
            <IconButton
              label="Próxima imagem"
              variant="outline"
              icon={<IconChevronRight />}
              onClick={() => goTo(index + 1)}
              disabled={count <= 1}
            />
          </div>
          <span className="text-sm text-foreground-muted">
            {index + 1} / {count}
          </span>
        </div>
      }
    >
      <div className="flex items-center justify-center">
        <img
          key={active.id}
          src={active.url}
          alt=""
          className="max-h-[70vh] w-full object-contain"
        />
      </div>
    </Dialog>
  )
}

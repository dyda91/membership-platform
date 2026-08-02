import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import ImageLightbox from "./ImageLightbox"
import type { FeedMedia } from "../../services/feed"

const images: FeedMedia[] = [
  {
    id: "m1",
    type: "IMAGE",
    mimeType: "image/png",
    size: 1,
    width: 100,
    height: 100,
    duration: null,
    position: 0,
    locked: false,
    url: "https://cdn/a.png",
  },
  {
    id: "m2",
    type: "IMAGE",
    mimeType: "image/png",
    size: 1,
    width: 100,
    height: 100,
    duration: null,
    position: 1,
    locked: false,
    url: "https://cdn/b.png",
  },
]

describe("ImageLightbox", () => {
  it("renders the active image and position", () => {
    render(<ImageLightbox images={images} initialIndex={0} onClose={vi.fn()} />)

    const img = document.body.querySelector("img")
    expect(img).toHaveAttribute("src", "https://cdn/a.png")
    expect(screen.getByText("1 / 2")).toBeInTheDocument()
  })

  it("navigates to the next image", async () => {
    const user = userEvent.setup()

    render(<ImageLightbox images={images} initialIndex={0} onClose={vi.fn()} />)

    await user.click(screen.getByRole("button", { name: "Próxima imagem" }))

    expect(screen.getByText("2 / 2")).toBeInTheDocument()
  })

  it("navigates to the previous image", async () => {
    const user = userEvent.setup()

    render(<ImageLightbox images={images} initialIndex={1} onClose={vi.fn()} />)

    await user.click(screen.getByRole("button", { name: "Imagem anterior" }))

    expect(screen.getByText("1 / 2")).toBeInTheDocument()
  })

  it("closes when Escape is pressed", async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(<ImageLightbox images={images} initialIndex={0} onClose={onClose} />)

    await user.keyboard("{Escape}")

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("renders nothing when there are no images", () => {
    const { container } = render(
      <ImageLightbox images={[]} initialIndex={0} onClose={vi.fn()} />,
    )

    expect(container).toBeEmptyDOMElement()
  })
})

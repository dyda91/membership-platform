import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import MediaErrorState from "./MediaErrorState"
import PostMediaGallery from "./PostMediaGallery"
import type { FeedMedia } from "../../services/feed"
const image = (overrides: Partial<FeedMedia> = {}): FeedMedia => ({
  id: "m1",
  type: "IMAGE",
  mimeType: "image/png",
  size: 1,
  width: null,
  height: null,
  duration: null,
  position: 0,
  locked: false,
  url: "https://cdn/image.png",
  ...overrides,
})

const video = (overrides: Partial<FeedMedia> = {}): FeedMedia => ({
  id: "v1",
  type: "VIDEO",
  mimeType: "video/mp4",
  size: 1,
  width: null,
  height: null,
  duration: null,
  position: 0,
  locked: false,
  url: "https://cdn/video.mp4",
  ...overrides,
})

describe("PostMediaGallery", () => {
  it("renders nothing when there is no media", () => {
    const { container } = render(<PostMediaGallery media={[]} />)

    expect(container).toBeEmptyDOMElement()
  })

  it("renders an image for a single authorized image", () => {
    const { container } = render(<PostMediaGallery media={[image()]} />)

    expect(container.querySelector("img")).toBeInTheDocument()
  })

  it("renders a locked placeholder for locked media without a URL", () => {
    render(
      <PostMediaGallery
        media={[image({ locked: true, url: undefined })]}
        requiredTier={{ id: "t", name: "Gold", priority: 5 }}
      />,
    )

    expect(screen.getByText("Conteúdo exclusivo")).toBeInTheDocument()
    expect(screen.getByText("Gold")).toBeInTheDocument()
    expect(screen.queryByRole("img")).not.toBeInTheDocument()
  })

  it("renders a video element for an authorized video", () => {
    const { container } = render(<PostMediaGallery media={[video()]} />)

    expect(container.querySelector("video")).toBeInTheDocument()
  })

  it("shows navigation and position for multiple media items", () => {
    const { container } = render(
      <PostMediaGallery media={[image(), image({ id: "m2", position: 1 })]} />,
    )

    expect(screen.getByRole("button", { name: "Mídia anterior" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Próxima mídia" })).toBeInTheDocument()
    expect(screen.getByText("1 / 2")).toBeInTheDocument()
    expect(container.querySelector("img")).toBeInTheDocument()
  })

  it("renders mixed media correctly per active item", () => {
    const { container } = render(
      <PostMediaGallery media={[image(), video({ id: "v1", position: 1 })]} />,
    )

    expect(container.querySelector("img")).toBeInTheDocument()
    expect(container.querySelector("video")).not.toBeInTheDocument()
  })

  it("does not open a lightbox for locked media", () => {
    render(
      <PostMediaGallery
        media={[image({ locked: true, url: undefined })]}
        requiredTier={{ id: "t", name: "Gold", priority: 5 }}
      />,
    )

    expect(screen.queryByRole("button", { name: "Ampliar imagem" })).not.toBeInTheDocument()
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("never renders a protected URL even if present on a locked item", () => {
    const { container } = render(
      <PostMediaGallery
        media={[
          image({
            id: "locked1",
            locked: true,
            url: "https://bucket.s3/presigned-protected-key",
          }),
        ]}
        requiredTier={{ id: "t", name: "Gold", priority: 5 }}
      />,
    )

    expect(container.innerHTML).not.toContain("presigned")
    expect(container.querySelector("img")).not.toBeInTheDocument()
    expect(container.querySelector("source")).not.toBeInTheDocument()
    expect(screen.getByText("Conteúdo exclusivo")).toBeInTheDocument()
  })

  it("opens the lightbox for an authorized image and closes with Escape", async () => {
    const user = userEvent.setup()
    render(<PostMediaGallery media={[image()]} />)

    await user.click(screen.getByRole("button", { name: "Ampliar imagem" }))

    expect(screen.getByRole("dialog", { name: "Imagem 1 de 1" })).toBeInTheDocument()
    expect(document.body.querySelector("img")).toHaveAttribute(
      "src",
      "https://cdn/image.png",
    )

    await user.keyboard("{Escape}")

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })
})

describe("MediaErrorState", () => {
  it("renders the error message", () => {
    render(<MediaErrorState />)

    expect(screen.getByText(/não foi possível carregar/i)).toBeInTheDocument()
  })
})

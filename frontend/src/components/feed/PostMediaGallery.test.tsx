import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import MediaErrorState from "./MediaErrorState"
import PostMediaGallery from "./PostMediaGallery"

describe("PostMediaGallery", () => {
  it("renders nothing when there is no media", () => {
    const { container } = render(
      <PostMediaGallery media={[]} tierName={null} />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it("renders an image for unlocked image media", () => {
    const { container } = render(
      <PostMediaGallery
        media={[
          {
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
          },
        ]}
        tierName={null}
      />,
    )

    expect(container.querySelector("img")).toBeInTheDocument()
  })

  it("renders a locked placeholder for locked media without a URL", () => {
    render(
      <PostMediaGallery
        media={[
          {
            id: "m1",
            type: "IMAGE",
            mimeType: "image/png",
            size: 1,
            width: null,
            height: null,
            duration: null,
            position: 0,
            locked: true,
          },
        ]}
        tierName="Gold"
      />,
    )

    expect(screen.getByText("Conteúdo exclusivo")).toBeInTheDocument()
    expect(screen.getByText("Disponível para o tier Gold")).toBeInTheDocument()
    expect(screen.queryByRole("img")).not.toBeInTheDocument()
  })

  it("renders a video element for unlocked video media", () => {
    const { container } = render(
      <PostMediaGallery
        media={[
          {
            id: "m1",
            type: "VIDEO",
            mimeType: "video/mp4",
            size: 1,
            width: null,
            height: null,
            duration: null,
            position: 0,
            locked: false,
            url: "https://cdn/video.mp4",
          },
        ]}
        tierName={null}
      />,
    )

    expect(container.querySelector("video")).toBeInTheDocument()
  })
})

describe("MediaErrorState", () => {
  it("renders the error message", () => {
    render(<MediaErrorState />)

    expect(screen.getByText(/não foi possível carregar/i)).toBeInTheDocument()
  })
})

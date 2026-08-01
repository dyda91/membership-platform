import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import ArtistHeader from "./ArtistHeader"
import NoArtistConfiguredState from "./NoArtistConfiguredState"
import ArtistContactActions from "./ArtistContactActions"

describe("ArtistHeader", () => {
  it("renders complete artist information", () => {
    render(
      <ArtistHeader
        artist={{
          configured: true,
          name: "Artist Name",
          bio: "Artist bio",
          presentationText: "Welcome presentation",
          avatarUrl: "https://cdn/avatar.png",
          bannerUrl: "https://cdn/banner.png",
          contactActions: [
            { type: "WHATSAPP", label: "Falar pelo WhatsApp", url: "https://wa.me/1" },
          ],
        }}
      />,
    )

    expect(screen.getByText("Artist Name")).toBeInTheDocument()
    expect(screen.getByText("Artist bio")).toBeInTheDocument()
    expect(screen.getByText("Welcome presentation")).toBeInTheDocument()
    expect(screen.getByText("Falar pelo WhatsApp")).toBeInTheDocument()
  })

  it("shows a fallback avatar when no avatar URL is present", () => {
    render(
      <ArtistHeader
        artist={{
          configured: true,
          name: "Artist Name",
          bio: null,
          presentationText: null,
          avatarUrl: null,
          bannerUrl: null,
          contactActions: [],
        }}
      />,
    )

    expect(screen.getByLabelText("Avatar")).toBeInTheDocument()
    expect(screen.getByText("A")).toBeInTheDocument()
  })

  it("does not crash with incomplete optional data", () => {
    render(
      <ArtistHeader
        artist={{
          configured: true,
          name: null,
          bio: null,
          presentationText: null,
          avatarUrl: null,
          bannerUrl: null,
          contactActions: [],
        }}
      />,
    )

    expect(screen.getByText("Artista")).toBeInTheDocument()
  })
})

describe("NoArtistConfiguredState", () => {
  it("shows a controlled message", () => {
    render(<NoArtistConfiguredState />)

    expect(screen.getByText("Perfil em configuração")).toBeInTheDocument()
  })
})

describe("ArtistContactActions", () => {
  it("renders only the provided actions", () => {
    render(
      <ArtistContactActions
        actions={[
          { type: "WHATSAPP", label: "WhatsApp", url: "https://wa.me/1" },
          { type: "DISCORD", label: "Discord", url: "https://discord.gg/1" },
        ]}
      />,
    )

    expect(screen.getByText("WhatsApp")).toBeInTheDocument()
    expect(screen.getByText("Discord")).toBeInTheDocument()
  })

  it("renders nothing when there are no actions", () => {
    const { container } = render(<ArtistContactActions actions={[]} />)

    expect(container).toBeEmptyDOMElement()
  })
})

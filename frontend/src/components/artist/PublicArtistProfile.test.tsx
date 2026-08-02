import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { ReactNode } from "react"
import PublicArtistProfile from "./PublicArtistProfile"
import NoArtistConfiguredState from "./NoArtistConfiguredState"
import ArtistContactActions from "./ArtistContactActions"
import type { FeedArtist } from "../../services/feed"

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>()
  return {
    ...actual,
    Link: ({ to, children }: { to: string; children: ReactNode }) => (
      <a href={to}>{children}</a>
    ),
  }
})

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({ canManageContent: false }),
}))

const completeArtist: FeedArtist = {
  configured: true,
  name: "Artist Name",
  bio: "Artist bio",
  presentationText: "Welcome presentation",
  avatarUrl: "https://cdn/avatar.png",
  bannerUrl: "https://cdn/banner.png",
  contactActions: [
    { type: "WHATSAPP", label: "Falar pelo WhatsApp", url: "https://wa.me/1" },
  ],
}

describe("PublicArtistProfile", () => {
  it("renders banner, avatar, name, bio and contacts", () => {
    render(<PublicArtistProfile artist={completeArtist} />)

    expect(screen.getByRole("heading", { level: 1, name: "Artist Name" })).toBeInTheDocument()
    expect(screen.getByText("Artist bio")).toBeInTheDocument()
    expect(screen.getByText("Welcome presentation")).toBeInTheDocument()
    expect(screen.getByText("Falar pelo WhatsApp")).toBeInTheDocument()
  })

  it("shows a controlled fallback when avatar and banner are absent", () => {
    render(
      <PublicArtistProfile
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

    expect(screen.getByRole("img", { name: "Artist Name" })).toBeInTheDocument()
    expect(screen.getByText("A")).toBeInTheDocument()
  })

  it("adapts when optional fields are empty", () => {
    render(
      <PublicArtistProfile
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

  it("does not show management controls to visitors", () => {
    render(<PublicArtistProfile artist={completeArtist} />)

    expect(screen.queryByText("Editar perfil")).not.toBeInTheDocument()
  })
})

describe("NoArtistConfiguredState", () => {
  it("shows a controlled message", () => {
    render(<NoArtistConfiguredState />)

    expect(screen.getByText("Perfil em configuração")).toBeInTheDocument()
  })
})

describe("ArtistContactActions", () => {
  it("renders only the provided actions with safe link attributes", () => {
    const actions: FeedArtist["contactActions"] = [
      { type: "WHATSAPP", label: "Falar pelo WhatsApp", url: "https://wa.me/1" },
      { type: "DISCORD", label: "Discord", url: "https://discord.gg/1" },
    ]

    const { container } = render(<ArtistContactActions actions={actions} />)

    const links = container.querySelectorAll("a")
    expect(links.length).toBe(2)
    expect(links[0]).toHaveAttribute("target", "_blank")
    expect(links[0]).toHaveAttribute("rel", "noopener noreferrer")
    expect(screen.getByText("Falar pelo WhatsApp")).toBeInTheDocument()
    expect(screen.getByText("Discord")).toBeInTheDocument()
  })

  it("renders nothing when there are no actions", () => {
    const { container } = render(<ArtistContactActions actions={[]} />)

    expect(container).toBeEmptyDOMElement()
  })
})

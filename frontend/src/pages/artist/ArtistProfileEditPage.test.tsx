import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { ReactNode } from "react"
import ArtistProfileEditPage from "./ArtistProfileEditPage"

vi.mock("../../services/artist-profile", () => ({
  fetchManageArtistProfile: vi.fn(),
  updateArtistProfile: vi.fn(),
  uploadArtistAvatar: vi.fn(),
  uploadArtistBanner: vi.fn(),
}))

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>()
  return {
    ...actual,
    Link: ({ to, children }: { to: string; children: ReactNode }) => (
      <a href={to}>{children}</a>
    ),
    useNavigate: () => navigateMock,
  }
})

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({ canManageContent: true }),
}))

import { fetchManageArtistProfile, updateArtistProfile } from "../../services/artist-profile"

const navigateMock = vi.fn()

const profile = {
  configured: true,
  artistUserId: "u1",
  name: "Artista Teste",
  bio: "Bio da artista",
  presentationText: "Apresentação",
  avatarUrl: "https://cdn/avatar.png",
  bannerUrl: "https://cdn/banner.png",
  whatsappValue: "5511999998888",
  whatsappEnabled: true,
  discordUrl: null,
  discordEnabled: false,
  contactButtonText: "Falar com a artista",
  contactActions: [],
}

describe("ArtistProfileEditPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    navigateMock.mockReset()
    vi.mocked(fetchManageArtistProfile).mockResolvedValue(profile as never)
    vi.mocked(updateArtistProfile).mockResolvedValue(profile as never)
  })

  it("organizes public identity, media, biography and contacts sections", async () => {
    render(<ArtistProfileEditPage />)

    expect(await screen.findByText("Identidade pública")).toBeInTheDocument()
    expect(screen.getByText("Avatar e banner")).toBeInTheDocument()
    expect(screen.getByText("Biografia e apresentação")).toBeInTheDocument()
    expect(screen.getByText("Contatos")).toBeInTheDocument()
    expect(screen.getByAltText("Avatar atual")).toBeInTheDocument()
    expect(screen.getByAltText("Banner atual")).toBeInTheDocument()
  })

  it("separates contact value from enabled state", async () => {
    render(<ArtistProfileEditPage />)

    await screen.findByText("Contatos")

    expect(screen.getByLabelText("WhatsApp")).toHaveValue("5511999998888")
    expect(screen.getByLabelText("Habilitar WhatsApp")).toBeChecked()
    expect(screen.getByLabelText("Habilitar Discord")).not.toBeChecked()
  })

  it("saves profile updates with success feedback", async () => {
    const user = userEvent.setup()
    render(<ArtistProfileEditPage />)

    await screen.findByText("Identidade pública")

    await user.clear(screen.getByLabelText("Nome"))
    await user.type(screen.getByLabelText("Nome"), "Novo Nome")
    await user.click(screen.getByRole("button", { name: "Salvar perfil" }))

    await waitFor(() => {
      expect(updateArtistProfile).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Novo Nome" }),
      )
    })

    expect(await screen.findByText("Perfil atualizado com sucesso.")).toBeInTheDocument()
  })

  it("warns about unsaved changes when leaving", async () => {
    const user = userEvent.setup()
    render(<ArtistProfileEditPage />)

    await screen.findByText("Identidade pública")

    await user.type(screen.getByLabelText("Nome"), "X")

    await user.click(screen.getByRole("button", { name: "Ver Feed" }))

    expect(
      screen.getByRole("dialog", { name: "Alterações não salvas" }),
    ).toBeInTheDocument()
    expect(navigateMock).not.toHaveBeenCalled()

    await user.click(screen.getByRole("button", { name: "Descartar alterações" }))

    expect(navigateMock).toHaveBeenCalledWith("/")
  })

  it("does not warn when there are no changes", async () => {
    const user = userEvent.setup()
    render(<ArtistProfileEditPage />)

    await screen.findByText("Identidade pública")

    await user.click(screen.getByRole("button", { name: "Ver Feed" }))

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(navigateMock).toHaveBeenCalledWith("/")
  })
})

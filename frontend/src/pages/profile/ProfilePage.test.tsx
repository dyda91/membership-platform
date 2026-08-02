import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { ReactNode } from "react"
import ProfilePage from "./ProfilePage"

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
  useAuth: () => mockAuth,
}))

vi.mock("../../services/profile", () => ({
  fetchOwnProfile: vi.fn(),
  updateOwnProfile: vi.fn(),
}))

vi.mock("../../services/artist", () => ({
  fetchArtistProfile: vi.fn(),
  updateArtistProfile: vi.fn(),
}))

import { fetchOwnProfile, updateOwnProfile } from "../../services/profile"

let mockAuth: {
  canManageContent: boolean
  user: { tier: null; tierAccessStatus: string; tierExpiresAt: null; tierPermanent: boolean }
}

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth = {
      canManageContent: false,
      user: {
        tier: null,
        tierAccessStatus: "NONE",
        tierExpiresAt: null,
        tierPermanent: false,
      },
    }
  })

  it("loads and edits the subscriber profile", async () => {
    vi.mocked(fetchOwnProfile).mockResolvedValue({
      id: "u1",
      name: "Subscriber",
      email: "sub@test.com",
    } as never)
    vi.mocked(updateOwnProfile).mockResolvedValue({
      id: "u1",
      name: "Updated",
    } as never)

    const user = userEvent.setup()
    render(<ProfilePage />)

    expect(await screen.findByText("Meu perfil")).toBeInTheDocument()

    const nameInput = screen.getByLabelText("Nome")
    await user.clear(nameInput)
    await user.type(nameInput, "Updated")
    await user.click(screen.getByRole("button", { name: "Salvar perfil" }))

    await waitFor(() => {
      expect(updateOwnProfile).toHaveBeenCalledWith({ name: "Updated" })
    })

    expect(
      await screen.findByText("Perfil atualizado com sucesso."),
    ).toBeInTheDocument()
  })

  it("shows the subscriber tier badge", async () => {
    vi.mocked(fetchOwnProfile).mockResolvedValue({
      id: "u1",
      name: "Subscriber",
      email: "sub@test.com",
    } as never)

    render(<ProfilePage />)

    expect(await screen.findByText("Gratuito")).toBeInTheDocument()
  })
})

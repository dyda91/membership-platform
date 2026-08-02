import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import TiersAdminPage from "./TiersAdminPage"

vi.mock("../../services/tiers", () => ({
  fetchTiers: vi.fn(),
  createTier: vi.fn(),
  updateTier: vi.fn(),
  deleteTier: vi.fn(),
}))

import { deleteTier, fetchTiers } from "../../services/tiers"

const tiers = [
  { id: "t1", name: "Free", description: "Gratuito", priority: 0, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
  { id: "t2", name: "Gold", description: "Ouro", priority: 5, createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" },
]

describe("TiersAdminPage", () => {
  beforeEach(() => {
    vi.mocked(fetchTiers).mockReset()
    vi.mocked(deleteTier).mockReset()
  })

  it("renders tiers loaded from the API", async () => {
    vi.mocked(fetchTiers).mockResolvedValue(tiers as never)

    render(<TiersAdminPage />)

    expect(await screen.findByText("Gerenciamento de Tiers")).toBeInTheDocument()
    expect(screen.getByText("Free")).toBeInTheDocument()
    expect(screen.getByText("Gold")).toBeInTheDocument()
  })

  it("shows an empty state when no tiers are configured", async () => {
    vi.mocked(fetchTiers).mockResolvedValue([] as never)

    render(<TiersAdminPage />)

    expect(await screen.findByText("Nenhum tier encontrado")).toBeInTheDocument()
  })

  it("deletes a tier after confirmation", async () => {
    vi.mocked(fetchTiers).mockResolvedValue(tiers as never)
    vi.mocked(deleteTier).mockResolvedValue({} as never)

    const user = userEvent.setup()
    render(<TiersAdminPage />)

    await screen.findByText("Gold")

    const deleteButtons = screen.getAllByRole("button", { name: "Excluir" })
    await user.click(deleteButtons[1])

    const dialog = screen.getByRole("dialog", { name: "Excluir tier" })
    await user.click(within(dialog).getByRole("button", { name: "Excluir" }))

    await waitFor(() => {
      expect(deleteTier).toHaveBeenCalledWith("t2")
    })
  })
})

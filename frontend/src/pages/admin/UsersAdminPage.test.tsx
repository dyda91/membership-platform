import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import UsersAdminPage from "./UsersAdminPage"

vi.mock("../../services/users", () => ({
  fetchUsers: vi.fn(),
  assignUserTier: vi.fn(),
  ACCOUNT_STATUSES: { ACTIVE: "ACTIVE", DISABLED: "DISABLED" },
}))

vi.mock("../../services/tiers", () => ({
  fetchTiers: vi.fn(),
}))

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({ user: { isSuperAdmin: true, roles: ["SUPER_ADMIN"] } }),
}))

import { assignUserTier, fetchUsers } from "../../services/users"
import { fetchTiers } from "../../services/tiers"

const makeUser = (overrides: Record<string, unknown> = {}) => ({
  id: "u1",
  email: "sub@test.com",
  name: "Subscriber",
  status: "ACTIVE",
  roles: ["SUBSCRIBER"],
  tierId: null,
  tier: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
})

const tiers = [
  { id: "t-free", name: "Free", description: "Gratuito", priority: 0 },
  { id: "t-silver", name: "Silver", description: "Prata", priority: 2 },
  { id: "t-gold", name: "Gold", description: "Ouro", priority: 5 },
]

describe("UsersAdminPage", () => {
  it("renders role and tier as separate columns with tiers loaded from API", async () => {
    vi.mocked(fetchUsers).mockResolvedValue({
      data: [makeUser()],
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    } as never)
    vi.mocked(fetchTiers).mockResolvedValue(tiers as never)

    render(<UsersAdminPage />)

    await waitFor(() => {
      expect(screen.getByText("sub@test.com")).toBeInTheDocument()
    })
    expect(screen.getByText("Role")).toBeInTheDocument()
    expect(screen.getByText("Tier")).toBeInTheDocument()
    expect(screen.getByText("Gratuito")).toBeInTheDocument()
  })

  it("opens access management and shows tier options from the API, not roles", async () => {
    vi.mocked(fetchUsers).mockResolvedValue({
      data: [makeUser()],
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    } as never)
    vi.mocked(fetchTiers).mockResolvedValue(tiers as never)

    const user = userEvent.setup()
    render(<UsersAdminPage />)

    await waitFor(() => {
      expect(screen.getByText("sub@test.com")).toBeInTheDocument()
    })

    await user.click(screen.getByText("Gerenciar acesso"))

    expect(screen.getAllByText("Role").length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Assinante/).length).toBeGreaterThan(0)
    expect(screen.getByDisplayValue("")).toBeInTheDocument()
    expect(screen.getByText("Free · prioridade 0")).toBeInTheDocument()
    expect(screen.getByText("Silver · prioridade 2")).toBeInTheDocument()
    expect(screen.getByText("Gold · prioridade 5")).toBeInTheDocument()
    expect(
      screen.queryByText(/Atribuir.*Artista/i),
    ).not.toBeInTheDocument()
  })

  it("assigns a tier and refreshes the row", async () => {
    vi.mocked(fetchUsers).mockResolvedValue({
      data: [makeUser()],
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
    } as never)
    vi.mocked(fetchTiers).mockResolvedValue(tiers as never)
    vi.mocked(assignUserTier).mockResolvedValue(
      makeUser({
        tierId: "t-silver",
        tier: { id: "t-silver", name: "Silver", priority: 2 },
      }) as never,
    )

    const user = userEvent.setup()
    render(<UsersAdminPage />)

    await waitFor(() => {
      expect(screen.getByText("sub@test.com")).toBeInTheDocument()
    })

    await user.click(screen.getByText("Gerenciar acesso"))
    await user.selectOptions(screen.getByTestId("tier-select"), "t-silver")
    await user.click(screen.getByText("Salvar tier"))

    await waitFor(() => {
      expect(screen.getByText("Silver")).toBeInTheDocument()
    })
  })

  it("searches users and resets pagination", async () => {
    vi.mocked(fetchUsers).mockResolvedValue({
      data: [],
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    } as never)
    vi.mocked(fetchTiers).mockResolvedValue(tiers as never)

    const user = userEvent.setup()
    render(<UsersAdminPage />)

    await waitFor(() => {
      expect(screen.getByText(/nenhum usuário/i)).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText("Buscar por nome ou e-mail")
    await user.type(searchInput, "maria")
    await user.click(screen.getByText("Buscar"))

    await waitFor(() => {
      expect(fetchUsers).toHaveBeenCalledWith(
        expect.objectContaining({ search: "maria", page: 1 }),
      )
    })
  })

  it("handles an empty result state", async () => {
    vi.mocked(fetchUsers).mockResolvedValue({
      data: [],
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    } as never)
    vi.mocked(fetchTiers).mockResolvedValue(tiers as never)

    render(<UsersAdminPage />)

    await waitFor(() => {
      expect(screen.getByText(/nenhum usuário encontrado/i)).toBeInTheDocument()
    })
  })
})

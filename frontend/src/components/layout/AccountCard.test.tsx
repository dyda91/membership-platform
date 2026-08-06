import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import AccountCard from "./AccountCard"
import type { SessionUser } from "../../services/auth"

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>()
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => mockAuth,
}))

let mockAuth: {
  user: SessionUser | null
  isAuthenticated: boolean
  isSuperAdmin: boolean
  logout: () => void
}

const baseUser: SessionUser = {
  id: "u1",
  email: "user@test.com",
  name: null,
  status: "ACTIVE",
  roles: ["SUBSCRIBER"],
  tier: null,
  tierId: null,
  tierPriority: null,
  isSuperAdmin: false,
  isArtist: false,
  isSubscriber: true,
}

function setup(collapsed = false) {
  return render(<AccountCard collapsed={collapsed} />)
}

describe("AccountCard", () => {
  beforeEach(() => {
    mockAuth = {
      user: { ...baseUser },
      isAuthenticated: true,
      isSuperAdmin: false,
      logout: vi.fn(),
    }
  })

  it("renders nothing without a user", () => {
    mockAuth = {
      user: null,
      isAuthenticated: false,
      isSuperAdmin: false,
      logout: vi.fn(),
    }

    setup()

    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })

  it("shows a subscriber tier context with a validity date", () => {
    mockAuth = {
      ...mockAuth,
      user: {
        ...baseUser,
        name: "Edjalma",
        tier: { id: "g", name: "Gold", priority: 2 },
        tierAccessStatus: "ACTIVE",
        tierExpiresAt: "2026-09-15T00:00:00.000Z",
      },
    }

    setup()

    expect(screen.getByText("Edjalma")).toBeInTheDocument()
    expect(screen.getByText(/Gold/)).toBeInTheDocument()
    expect(screen.getByText(/Válido até/)).toBeInTheDocument()
  })

  it("shows permanent access for a permanent tier", () => {
    mockAuth = {
      ...mockAuth,
      user: {
        ...baseUser,
        name: "Edjalma",
        tier: { id: "s", name: "Silver", priority: 1 },
        tierAccessStatus: "PERMANENT",
        tierPermanent: true,
      },
    }

    setup()

    expect(screen.getByText(/Acesso permanente/)).toBeInTheDocument()
  })

  it("does not present an expired premium tier as active", () => {
    mockAuth = {
      ...mockAuth,
      user: {
        ...baseUser,
        name: "Edjalma",
        tier: { id: "g", name: "Gold", priority: 2 },
        tierAccessStatus: "EXPIRED",
        tierExpiresAt: "2026-01-01T00:00:00.000Z",
      },
    }

    setup()

    expect(screen.getByText(/Gratuito/)).toBeInTheDocument()
    expect(screen.getByText(/Gold expirado/)).toBeInTheDocument()
  })

  it("shows artist role context", () => {
    mockAuth = {
      ...mockAuth,
      user: {
        ...baseUser,
        name: "Nome da artista",
        roles: ["ARTIST"],
        isArtist: true,
        isSubscriber: false,
      },
    }

    setup()

    expect(screen.getByText("Nome da artista")).toBeInTheDocument()
    expect(screen.getByText(/Artista/)).toBeInTheDocument()
    expect(screen.getByText(/Gerenciamento da plataforma/)).toBeInTheDocument()
  })

  it("shows super admin role context", () => {
    mockAuth = {
      ...mockAuth,
      user: {
        ...baseUser,
        name: "Admin",
        roles: ["SUPER_ADMIN"],
        isSuperAdmin: true,
        isSubscriber: false,
      },
    }

    setup()

    expect(screen.getByText(/Super Admin/)).toBeInTheDocument()
    expect(screen.getByText(/Administração do sistema/)).toBeInTheDocument()
  })

  it("opens the account menu with profile and security actions", async () => {
    const user = userEvent.setup()

    setup()

    await user.click(screen.getAllByRole("button")[0])

    expect(screen.getByRole("menu", { name: "Menu da conta" })).toBeInTheDocument()
    expect(screen.getByRole("menuitem", { name: /Perfil/ })).toBeInTheDocument()
    expect(
      screen.getByRole("menuitem", { name: /Segurança da conta/ }),
    ).toBeInTheDocument()
    expect(screen.getByRole("menuitem", { name: /Sair/ })).toBeInTheDocument()
  })

  it("includes artist configuration for a super admin", async () => {
    const user = userEvent.setup()
    mockAuth = {
      ...mockAuth,
      user: {
        ...baseUser,
        name: "Admin",
        roles: ["SUPER_ADMIN"],
        isSuperAdmin: true,
        isSubscriber: false,
      },
    }

    setup()

    await user.click(screen.getAllByRole("button")[0])

    expect(
      screen.getByRole("menuitem", { name: /Configurar artista/ }),
    ).toBeInTheDocument()
  })

  it("calls logout from the menu", async () => {
    const user = userEvent.setup()
    const logout = vi.fn()
    mockAuth = { ...mockAuth, logout }

    setup()

    await user.click(screen.getAllByRole("button")[0])
    await user.click(screen.getByRole("menuitem", { name: /Sair/ }))

    expect(logout).toHaveBeenCalledTimes(1)
  })

  it("closes the menu with Escape and returns focus to the trigger", async () => {
    const user = userEvent.setup()

    setup()

    const trigger = screen.getAllByRole("button")[0]
    await user.click(trigger)
    await user.keyboard("{Escape}")

    expect(screen.queryByRole("menu")).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })
})

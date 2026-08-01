import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { ReactNode } from "react"
import RequireAdmin from "./RequireAdmin"
import RequireContentManager from "./RequireContentManager"
import RequireAuth from "./RequireAuth"
import type { SessionUser } from "../../services/auth"

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>()
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">protected content</div>,
    Navigate: ({ to }: { to: string }) => (
      <div data-testid="navigate">{to}</div>
    ),
  }
})

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => mockAuth,
}))

const makeUser = (roles: SessionUser["roles"]): SessionUser => ({
  id: "u1",
  email: "user@test.com",
  name: null,
  status: "ACTIVE",
  roles,
  tier: null,
  tierId: null,
  tierPriority: null,
  isSuperAdmin: roles.includes("SUPER_ADMIN"),
  isArtist: roles.includes("ARTIST"),
  isSubscriber: roles.includes("SUBSCRIBER"),
})

let mockAuth: {
  user: SessionUser | null
  isLoading: boolean
  isAuthenticated: boolean
}

function renderWithGuard(guard: ReactNode) {
  return render(<MemoryRouter>{guard}</MemoryRouter>)
}

describe("Route guards", () => {
  beforeEach(() => {
    mockAuth = {
      user: null,
      isLoading: false,
      isAuthenticated: false,
    }
  })

  it("RequireAdmin redirects subscribers to the feed", () => {
    mockAuth = {
      user: makeUser(["SUBSCRIBER"]),
      isLoading: false,
      isAuthenticated: true,
    }

    renderWithGuard(<RequireAdmin />)

    expect(screen.getByText("/")).toBeInTheDocument()
  })

  it("RequireAdmin allows artists through", () => {
    mockAuth = {
      user: makeUser(["ARTIST"]),
      isLoading: false,
      isAuthenticated: true,
    }

    renderWithGuard(<RequireAdmin />)

    expect(screen.getByTestId("outlet")).toBeInTheDocument()
  })

  it("RequireContentManager blocks subscribers", () => {
    mockAuth = {
      user: makeUser(["SUBSCRIBER"]),
      isLoading: false,
      isAuthenticated: true,
    }

    renderWithGuard(<RequireContentManager />)

    expect(screen.getByText("/")).toBeInTheDocument()
  })

  it("RequireContentManager allows promoted artists", () => {
    mockAuth = {
      user: makeUser(["ARTIST"]),
      isLoading: false,
      isAuthenticated: true,
    }

    renderWithGuard(<RequireContentManager />)

    expect(screen.getByTestId("outlet")).toBeInTheDocument()
  })

  it("RequireAuth redirects visitors to login", () => {
    mockAuth = {
      user: null,
      isLoading: false,
      isAuthenticated: false,
    }

    renderWithGuard(<RequireAuth />)

    expect(screen.getByText("/login")).toBeInTheDocument()
  })

  it("RequireAuth shows loading while the session initializes", () => {
    mockAuth = {
      user: null,
      isLoading: true,
      isAuthenticated: false,
    }

    renderWithGuard(<RequireAuth />)

    expect(screen.getByText(/carregando/i)).toBeInTheDocument()
  })
})

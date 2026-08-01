import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"
import type { ReactNode } from "react"
import RequireAdmin from "./RequireAdmin"
import RequireContentManager from "./RequireContentManager"
import RequireAuth from "./RequireAuth"

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

interface AuthValue {
  isAdmin: boolean
  canManageContent: boolean
  isAuthenticated: boolean
  isLoading: boolean
}

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => mockAuth,
}))

let mockAuth: AuthValue

function renderWithGuard(guard: ReactNode) {
  return render(<MemoryRouter>{guard}</MemoryRouter>)
}

describe("Route guards", () => {
  it("RequireAdmin redirects subscribers to the feed", () => {
    mockAuth = {
      isAdmin: false,
      canManageContent: false,
      isAuthenticated: true,
      isLoading: false,
    }

    renderWithGuard(<RequireAdmin />)

    expect(screen.getByText("/")).toBeInTheDocument()
  })

  it("RequireAdmin allows artists through", () => {
    mockAuth = {
      isAdmin: true,
      canManageContent: true,
      isAuthenticated: true,
      isLoading: false,
    }

    renderWithGuard(<RequireAdmin />)

    expect(screen.getByTestId("outlet")).toBeInTheDocument()
  })

  it("RequireContentManager blocks subscribers", () => {
    mockAuth = {
      isAdmin: false,
      canManageContent: false,
      isAuthenticated: true,
      isLoading: false,
    }

    renderWithGuard(<RequireContentManager />)

    expect(screen.getByText("/")).toBeInTheDocument()
  })

  it("RequireAuth redirects visitors to login", () => {
    mockAuth = {
      isAdmin: false,
      canManageContent: false,
      isAuthenticated: false,
      isLoading: false,
    }

    renderWithGuard(<RequireAuth />)

    expect(screen.getByText("/login")).toBeInTheDocument()
  })
})

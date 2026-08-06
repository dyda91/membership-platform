import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import type { ReactNode } from "react"
import MainLayout from "./MainLayout"
import type { SessionUser } from "../../services/auth"

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => mockAuth,
}))

vi.mock("../../contexts/MessagingUnreadContext", () => ({
  useMessagingUnread: () => ({ unreadCount: 0, refreshUnread: vi.fn() }),
}))

vi.mock("../../hooks/useMediaQuery", () => ({
  useMediaQuery: () => true,
}))

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>()
  return {
    ...actual,
    Link: ({ to, children }: { to: string; children: ReactNode }) => (
      <a href={to}>{children}</a>
    ),
    NavLink: ({
      to,
      children,
      className,
    }: {
      to: string
      children: ReactNode
      className?: string | ((state: { isActive: boolean }) => string)
    }) => (
      <a
        href={to}
        className={
          typeof className === "function" ? className({ isActive: false }) : className
        }
      >
        {children}
      </a>
    ),
  }
})

let mockAuth: {
  user: SessionUser | null
  isAuthenticated: boolean
  isLoading: boolean
  isSuperAdmin: boolean
  logout: () => void
}

function setup() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<div>Page content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
}

describe("MainLayout", () => {
  beforeEach(() => {
    mockAuth = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isSuperAdmin: false,
      logout: vi.fn(),
    }
  })

  it("shows a loading state while the session is unresolved", () => {
    mockAuth = { ...mockAuth, isLoading: true }

    setup()

    expect(screen.getByText("Carregando…")).toBeInTheDocument()
  })

  it("renders the public shell for visitors", () => {
    setup()

    expect(screen.getByRole("link", { name: "Entrar" })).toBeInTheDocument()
    expect(screen.queryByRole("navigation", { name: "Navegação principal" })).not.toBeInTheDocument()
  })

  it("renders the authenticated shell with the sidebar for a signed-in user", () => {
    mockAuth = {
      user: {
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
      },
      isAuthenticated: true,
      isLoading: false,
      isSuperAdmin: false,
      logout: vi.fn(),
    }

    setup()

    expect(screen.getByRole("navigation", { name: "Navegação da plataforma" })).toBeInTheDocument()
    expect(screen.getByText("Page content")).toBeInTheDocument()
  })
})

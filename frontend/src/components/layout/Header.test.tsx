import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { ReactNode } from "react"
import Header from "./Header"
import type { SessionUser } from "../../services/auth"

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
        className={typeof className === "function" ? className({ isActive: false }) : className}
      >
        {children}
      </a>
    ),
  }
})

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => mockAuth,
}))

vi.mock("../../contexts/MessagingUnreadContext", () => ({
  useMessagingUnread: () => ({ unreadCount: 0, refreshUnread: vi.fn() }),
}))

let mockAuth: {
  user: SessionUser | null
  isAuthenticated: boolean
  isSuperAdmin: boolean
  logout: () => void
}

const makeUser = (roles: SessionUser["roles"], email = "user@test.com"): SessionUser => ({
  id: "u1",
  email,
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

describe("Header", () => {
  beforeEach(() => {
    mockAuth = {
      user: null,
      isAuthenticated: false,
      isSuperAdmin: false,
      logout: vi.fn(),
    }
  })

  it("shows the mobile navigation trigger", () => {
    const onOpen = vi.fn()
    render(<Header onOpenMobileNav={onOpen} />)

    expect(
      screen.getByRole("button", { name: "Abrir menu de navegação" }),
    ).toBeInTheDocument()
  })

  it("shows a visitor the authentication actions", () => {
    render(<Header onOpenMobileNav={() => undefined} />)

    expect(screen.getByText("Entrar")).toBeInTheDocument()
    expect(screen.getByText("Criar conta")).toBeInTheDocument()
    expect(screen.queryByText("Sair")).not.toBeInTheDocument()
  })

  it("shows an authenticated subscriber without administrative links", () => {
    mockAuth = {
      user: makeUser(["SUBSCRIBER"]),
      isAuthenticated: true,
      isSuperAdmin: false,
      logout: vi.fn(),
    }

    render(<Header onOpenMobileNav={() => undefined} />)

    expect(screen.getByText("Feed")).toBeInTheDocument()
    expect(screen.getByText("Perfil")).toBeInTheDocument()
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument()
    expect(screen.getByText("Sair")).toBeInTheDocument()
  })

  it("shows an artist the administrative navigation", () => {
    mockAuth = {
      user: makeUser(["ARTIST"]),
      isAuthenticated: true,
      isSuperAdmin: false,
      logout: vi.fn(),
    }

    render(<Header onOpenMobileNav={() => undefined} />)

    expect(screen.getByText("Dashboard")).toBeInTheDocument()
    expect(screen.getByText("Posts")).toBeInTheDocument()
    expect(screen.getByText("Usuários")).toBeInTheDocument()
    expect(screen.getByText("Tiers")).toBeInTheDocument()
  })

  it("shows the super administrator the artist configuration link", () => {
    mockAuth = {
      user: makeUser(["SUPER_ADMIN"]),
      isAuthenticated: true,
      isSuperAdmin: true,
      logout: vi.fn(),
    }

    render(<Header onOpenMobileNav={() => undefined} />)

    expect(screen.getByText("Configurar artista")).toBeInTheDocument()
  })

  it("handles long email addresses without breaking the header", () => {
    mockAuth = {
      user: makeUser(
        ["SUBSCRIBER"],
        "very-long-email-address-that-exceeds-the-header@example.com",
      ),
      isAuthenticated: true,
      isSuperAdmin: false,
      logout: vi.fn(),
    }

    render(<Header onOpenMobileNav={() => undefined} />)

    const email = screen.getByTitle("very-long-email-address-that-exceeds-the-header@example.com")
    expect(email).toHaveClass("truncate")
  })

  it("logs out from the header action", async () => {
    const user = userEvent.setup()
    const logout = vi.fn()

    mockAuth = {
      user: makeUser(["SUBSCRIBER"]),
      isAuthenticated: true,
      isSuperAdmin: false,
      logout,
    }

    render(<Header onOpenMobileNav={() => undefined} />)

    await user.click(screen.getByText("Sair"))

    expect(logout).toHaveBeenCalledTimes(1)
  })
})

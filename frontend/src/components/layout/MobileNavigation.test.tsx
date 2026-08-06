import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter } from "react-router-dom"
import type { ReactNode } from "react"
import MobileNavigation from "./MobileNavigation"
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
      onClick,
    }: {
      to: string
      children: ReactNode
      className?: string | ((state: { isActive: boolean }) => string)
      onClick?: () => void
    }) => (
      <a
        href={to}
        onClick={onClick}
        className={
          typeof className === "function" ? className({ isActive: false }) : className
        }
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
  useMessagingUnread: () => ({
    unreadCount: mockUnreadCount,
    refreshUnread: vi.fn(),
  }),
}))

let mockAuth: {
  user: SessionUser | null
  isAuthenticated: boolean
  isSuperAdmin: boolean
  logout: () => void
}
let mockUnreadCount: number

const makeUser = (roles: SessionUser["roles"]): SessionUser => ({
  id: "u1",
  email: "sub@test.com",
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

function setup() {
  return render(
    <MemoryRouter>
      <MobileNavigation />
    </MemoryRouter>,
  )
}

describe("MobileNavigation", () => {
  beforeEach(() => {
    mockUnreadCount = 0
    mockAuth = {
      user: null,
      isAuthenticated: false,
      isSuperAdmin: false,
      logout: vi.fn(),
    }
  })

  it("renders nothing for visitors", () => {
    setup()

    expect(screen.queryByRole("navigation")).not.toBeInTheDocument()
  })

  it("renders subscriber primary destinations without admin links", () => {
    mockAuth = {
      user: makeUser(["SUBSCRIBER"]),
      isAuthenticated: true,
      isSuperAdmin: false,
      logout: vi.fn(),
    }

    setup()

    expect(screen.getByRole("navigation", { name: "Navegação principal" })).toBeInTheDocument()
    expect(screen.getByText("Feed")).toBeInTheDocument()
    expect(screen.getByText("Mensagens")).toBeInTheDocument()
    expect(screen.getByText("Perfil")).toBeInTheDocument()
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument()
  })

  it("renders dashboard for an artist and a More action", () => {
    mockAuth = {
      user: makeUser(["ARTIST"]),
      isAuthenticated: true,
      isSuperAdmin: false,
      logout: vi.fn(),
    }

    setup()

    expect(screen.getByText("Dashboard")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Mais" })).toBeInTheDocument()
  })

  it("shows the unread badge on the Messages destination", () => {
    mockUnreadCount = 5
    mockAuth = {
      user: makeUser(["SUBSCRIBER"]),
      isAuthenticated: true,
      isSuperAdmin: false,
      logout: vi.fn(),
    }

    setup()

    expect(screen.getByText("5")).toBeInTheDocument()
  })

  it("opens the More drawer with account destinations and logout", async () => {
    const user = userEvent.setup()
    mockAuth = {
      user: makeUser(["SUBSCRIBER"]),
      isAuthenticated: true,
      isSuperAdmin: false,
      logout: vi.fn(),
    }

    setup()

    await user.click(screen.getByRole("button", { name: "Mais" }))

    expect(screen.getByRole("dialog", { name: "Mais opções" })).toBeInTheDocument()
    expect(screen.getByText("Segurança")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Sair" })).toBeInTheDocument()
  })

  it("keeps the drawer free of administrative links for a subscriber", async () => {
    const user = userEvent.setup()
    mockAuth = {
      user: makeUser(["SUBSCRIBER"]),
      isAuthenticated: true,
      isSuperAdmin: false,
      logout: vi.fn(),
    }

    setup()

    await user.click(screen.getByRole("button", { name: "Mais" }))

    expect(screen.queryByText("Usuários")).not.toBeInTheDocument()
    expect(screen.queryByText("Posts")).not.toBeInTheDocument()
  })

  it("closes the More drawer with Escape", async () => {
    const user = userEvent.setup()
    mockAuth = {
      user: makeUser(["SUBSCRIBER"]),
      isAuthenticated: true,
      isSuperAdmin: false,
      logout: vi.fn(),
    }

    setup()

    await user.click(screen.getByRole("button", { name: "Mais" }))
    await user.keyboard("{Escape}")

    expect(screen.queryByRole("dialog", { name: "Mais opções" })).not.toBeInTheDocument()
  })

  it("calls logout from the drawer", async () => {
    const user = userEvent.setup()
    const logout = vi.fn()
    mockAuth = {
      user: makeUser(["SUBSCRIBER"]),
      isAuthenticated: true,
      isSuperAdmin: false,
      logout,
    }

    setup()

    await user.click(screen.getByRole("button", { name: "Mais" }))
    await user.click(screen.getByRole("button", { name: "Sair" }))

    expect(logout).toHaveBeenCalledTimes(1)
  })
})

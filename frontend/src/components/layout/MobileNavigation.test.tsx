import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
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

function setup(open = true) {
  const onClose = vi.fn()
  render(<MobileNavigation open={open} onClose={onClose} />)

  return { onClose }
}

describe("MobileNavigation", () => {
  beforeEach(() => {
    mockAuth = {
      user: null,
      isAuthenticated: false,
      isSuperAdmin: false,
      logout: vi.fn(),
    }
  })

  it("renders nothing when closed", () => {
    setup(false)

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("renders a modal dialog with role-aware navigation", () => {
    mockAuth = {
      user: makeUser(["ARTIST"]),
      isAuthenticated: true,
      isSuperAdmin: false,
      logout: vi.fn(),
    }

    setup()

    expect(screen.getByRole("dialog", { name: "Menu de navegação" })).toBeInTheDocument()
    expect(screen.getByText("Dashboard")).toBeInTheDocument()
    expect(screen.getByText("Usuários")).toBeInTheDocument()
    expect(screen.getByText("Sair")).toBeInTheDocument()
  })

  it("keeps subscriber navigation free of administrative links", () => {
    mockAuth = {
      user: makeUser(["SUBSCRIBER"]),
      isAuthenticated: true,
      isSuperAdmin: false,
      logout: vi.fn(),
    }

    setup()

    expect(screen.getByText("Feed")).toBeInTheDocument()
    expect(screen.getByText("Perfil")).toBeInTheDocument()
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument()
  })

  it("closes via the explicit close action", async () => {
    const user = userEvent.setup()
    const { onClose } = setup()

    await user.click(screen.getByRole("button", { name: "Fechar menu" }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("closes after selecting a route", async () => {
    const user = userEvent.setup()
    mockAuth = {
      user: makeUser(["SUBSCRIBER"]),
      isAuthenticated: true,
      isSuperAdmin: false,
      logout: vi.fn(),
    }

    const { onClose } = setup()

    await user.click(screen.getByText("Perfil"))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("supports Escape dismissal", async () => {
    const user = userEvent.setup()
    const { onClose } = setup()

    await user.keyboard("{Escape}")

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("renders the trigger-visible close button with a touch target", () => {
    setup()

    const close = screen.getByRole("button", { name: "Fechar menu" })
    expect(close).toHaveClass("h-10 w-10")
  })

  it("keeps logout accessible for authenticated users", () => {
    mockAuth = {
      user: makeUser(["SUBSCRIBER"]),
      isAuthenticated: true,
      isSuperAdmin: false,
      logout: vi.fn(),
    }

    setup()

    expect(screen.getByRole("button", { name: "Sair" })).toBeInTheDocument()
  })
})

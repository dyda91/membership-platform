import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter } from "react-router-dom"
import type { ReactNode } from "react"
import DesktopSidebar from "./DesktopSidebar"
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

vi.mock("../../hooks/useMediaQuery", () => ({
  useMediaQuery: () => true,
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

function setup() {
  return render(
    <MemoryRouter>
      <DesktopSidebar />
    </MemoryRouter>,
  )
}

describe("DesktopSidebar", () => {
  beforeEach(() => {
    mockUnreadCount = 0
    mockAuth = {
      user: null,
      isAuthenticated: false,
      isSuperAdmin: false,
      logout: vi.fn(),
    }
  })

  it("renders nothing for a visitor", () => {
    setup()

    expect(screen.queryByRole("navigation")).not.toBeInTheDocument()
  })

  it("keeps subscriber navigation free of administrative items", () => {
    mockAuth = {
      user: makeUser(["SUBSCRIBER"]),
      isAuthenticated: true,
      isSuperAdmin: false,
      logout: vi.fn(),
    }

    setup()

    expect(screen.getByText("Feed")).toBeInTheDocument()
    expect(screen.getByText("Mensagens")).toBeInTheDocument()
    expect(screen.getByText("Perfil")).toBeInTheDocument()
    expect(screen.getByText("Segurança")).toBeInTheDocument()
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument()
    expect(screen.queryByText("Usuários")).not.toBeInTheDocument()
    expect(screen.queryByText("Administração")).not.toBeInTheDocument()
  })

  it("shows management and artist groups for an artist", () => {
    mockAuth = {
      user: makeUser(["ARTIST"]),
      isAuthenticated: true,
      isSuperAdmin: false,
      logout: vi.fn(),
    }

    setup()

    expect(screen.getByText("Administração")).toBeInTheDocument()
    expect(screen.getByText("Dashboard")).toBeInTheDocument()
    expect(screen.getByText("Posts")).toBeInTheDocument()
    expect(screen.getByText("Usuários")).toBeInTheDocument()
    expect(screen.getByText("Tiers")).toBeInTheDocument()
    expect(screen.getByText("Artista")).toBeInTheDocument()
    expect(screen.getByText("Página da artista")).toBeInTheDocument()
  })

  it("shows the artist configuration destination for a super administrator", () => {
    mockAuth = {
      user: makeUser(["SUPER_ADMIN"]),
      isAuthenticated: true,
      isSuperAdmin: true,
      logout: vi.fn(),
    }

    setup()

    expect(screen.getByText("Configurar artista")).toBeInTheDocument()
    expect(screen.getByText(/Super Admin/)).toBeInTheDocument()
  })

  it("renders the unread badge on the Messages item", () => {
    mockUnreadCount = 7
    mockAuth = {
      user: makeUser(["SUBSCRIBER"]),
      isAuthenticated: true,
      isSuperAdmin: false,
      logout: vi.fn(),
    }

    setup()

    expect(screen.getByText("7")).toBeInTheDocument()
    expect(
      screen.getByLabelText("7 mensagens não lidas"),
    ).toBeInTheDocument()
  })

  it("renders the account card identity", () => {
    mockAuth = {
      user: {
        ...makeUser(["SUBSCRIBER"]),
        name: "Edjalma",
      },
      isAuthenticated: true,
      isSuperAdmin: false,
      logout: vi.fn(),
    }

    setup()

    expect(screen.getByText("Edjalma")).toBeInTheDocument()
  })

  it("collapses and expands via the toggle control, persisting the preference", async () => {
    const user = userEvent.setup()
    mockAuth = {
      user: makeUser(["SUBSCRIBER"]),
      isAuthenticated: true,
      isSuperAdmin: false,
      logout: vi.fn(),
    }

    setup()

    expect(screen.getByRole("button", { name: "Recolher" })).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Recolher" }))
    expect(screen.getByRole("button", { name: "Expandir" })).toBeInTheDocument()
    expect(window.localStorage.getItem("sidebarCollapsed")).toBe("1")

    await user.click(screen.getByRole("button", { name: "Expandir" }))
    expect(screen.getByRole("button", { name: "Recolher" })).toBeInTheDocument()
    expect(window.localStorage.getItem("sidebarCollapsed")).toBe("0")
  })
})

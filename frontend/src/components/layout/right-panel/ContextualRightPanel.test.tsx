import { render, screen } from "@testing-library/react"
import { useEffect } from "react"
import { describe, expect, it, vi } from "vitest"
import { MemoryRouter } from "react-router-dom"
import type { ReactNode } from "react"

import { RightPanelProvider, useRightPanel } from "./RightPanelContext"
import ContextualRightPanel from "./ContextualRightPanel"

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>()
  return { ...actual, Link: ({ to, children }: { to: string; children: ReactNode }) => <a href={to}>{children}</a> }
})

vi.mock("../../../contexts/AuthContext", () => ({
  useAuth: () => ({
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
    logout: vi.fn(),
  }),
}))

vi.mock("../../../contexts/MessagingUnreadContext", () => ({
  useMessagingUnread: () => ({ unreadCount: 0, refreshUnread: vi.fn() }),
}))

vi.mock("../../../hooks/useDashboardSummary", () => ({
  useDashboardSummary: () => ({
    summary: { visibleUsers: 10, publishedPosts: 5, draftPosts: 2, archivedPosts: 1, tiers: 3, activeAccess: 4, expiringSoonAccess: 1, expiredAccess: 0, permanentAccess: 2, scheduledAccess: 0, revokedAccess: 0 },
    loading: false,
    error: null,
    refresh: vi.fn(),
  }),
}))

function Publisher({ children }: { children: ReactNode }) {
  const { setContent } = useRightPanel()

  useEffect(() => {
    setContent(children)
  }, [children, setContent])

  return null
}

function renderPanel(route: string, publisher?: ReactNode) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <RightPanelProvider>
        {publisher}
        <ContextualRightPanel />
      </RightPanelProvider>
    </MemoryRouter>,
  )
}

describe("ContextualRightPanel", () => {
  it("renders the account panel for /profile", () => {
    renderPanel("/profile")

    expect(screen.getByLabelText("Painel contextual")).toBeInTheDocument()
    expect(screen.getByText("Sua conta")).toBeInTheDocument()
  })

  it("renders the account panel for /profile/security", () => {
    renderPanel("/profile/security")

    expect(screen.getByText("Sua conta")).toBeInTheDocument()
  })

  it("renders the posts panel for /posts", () => {
    renderPanel("/posts")

    expect(screen.getByText("Conteúdo")).toBeInTheDocument()
  })

  it("renders nothing when no panel applies and no page content is published", () => {
    renderPanel("/")

    expect(screen.queryByLabelText("Painel contextual")).not.toBeInTheDocument()
  })

  it("renders page-published content instead of the static fallback", () => {
    renderPanel("/posts", <Publisher><div>Conteúdo customizado da página</div></Publisher>)

    expect(screen.getByText("Conteúdo customizado da página")).toBeInTheDocument()
    expect(screen.queryByText("Visibilidade")).not.toBeInTheDocument()
  })
})

import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { ReactNode } from "react"

import ConversationSidePanel from "./ConversationSidePanel"
import type { ConversationPanelDetail } from "./ConversationSidePanel"

vi.mock("react-router-dom", () => ({
  Link: ({ to, children }: { to: string; children: ReactNode }) => (
    <a href={to}>{children}</a>
  ),
}))

let mockUser: {
  id: string
  email: string
  name: string | null
  status: string
  roles: string[]
  tier: null
  tierId: null
  tierPriority: null
  isSuperAdmin: boolean
  isArtist: boolean
  isSubscriber: boolean
} | null

vi.mock("../../../contexts/AuthContext", () => ({
  useAuth: () => ({ user: mockUser, isAuthenticated: Boolean(mockUser), logout: vi.fn() }),
}))

const detail: ConversationPanelDetail = {
  memberId: "member-1",
  artist: { name: "Nome da artista" },
  member: { name: "Membro 1", email: "membro1@test.com" },
  memberEffectiveTier: { id: "g", name: "Gold", priority: 2 },
  accessStatus: "ACTIVE",
  accessExpiresAt: "2026-09-15T00:00:00.000Z",
  memberUnread: 2,
}

const memberUser = {
  id: "member-1",
  email: "membro1@test.com",
  name: "Membro 1",
  status: "ACTIVE",
  roles: ["SUBSCRIBER"],
  tier: null,
  tierId: null,
  tierPriority: null,
  isSuperAdmin: false,
  isArtist: false,
  isSubscriber: true,
}

const artistUser = {
  ...memberUser,
  id: "artist-1",
  roles: ["ARTIST"],
  isArtist: true,
  isSubscriber: false,
}

describe("ConversationSidePanel", () => {
  it("shows an empty state without a selected conversation", () => {
    mockUser = memberUser
    render(<ConversationSidePanel detail={null} />)

    expect(screen.getByText(/Selecione uma conversa/)).toBeInTheDocument()
  })

  it("shows only the artist summary to a member without administrative data", () => {
    mockUser = memberUser
    render(<ConversationSidePanel detail={detail} />)

    expect(screen.getByText("Nome da artista")).toBeInTheDocument()
    expect(screen.queryByText("membro1@test.com")).not.toBeInTheDocument()
    expect(screen.queryByRole("link", { name: "Gerenciar membro" })).not.toBeInTheDocument()
    expect(screen.queryByText("Gold")).not.toBeInTheDocument()
  })

  it("shows member details and access to the artist", () => {
    mockUser = artistUser
    render(<ConversationSidePanel detail={detail} />)

    expect(screen.getByText("Membro 1")).toBeInTheDocument()
    expect(screen.getByText("membro1@test.com")).toBeInTheDocument()
    expect(screen.getByText("Gold")).toBeInTheDocument()
    expect(screen.getByText(/Válido até/)).toBeInTheDocument()
    expect(screen.getByText(/2 mensagens não lidas/)).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Gerenciar membro" })).toHaveAttribute(
      "href",
      "/users?search=membro1%40test.com",
    )
  })

  it("hides the management shortcut from a plain subscriber admin-less view", () => {
    mockUser = memberUser
    render(<ConversationSidePanel detail={detail} />)

    expect(screen.queryByRole("link", { name: "Gerenciar membro" })).not.toBeInTheDocument()
  })
})

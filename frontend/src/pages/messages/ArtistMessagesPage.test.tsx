import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import ArtistMessagesPage from "./ArtistMessagesPage"
import type { ConversationThread } from "../../hooks/useConversationThread"

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "a1", roles: ["ARTIST"] } }),
}))

vi.mock("../../hooks/useMediaQuery", () => ({
  useMediaQuery: () => true,
}))

vi.mock("../../services/messaging", () => ({
  listConversations: vi.fn(),
  getConversation: vi.fn(),
  getHistory: vi.fn(),
  sendMessage: vi.fn(),
  markConversationRead: vi.fn(),
  getUnreadCount: vi.fn(),
  getOrCreateConversation: vi.fn(),
}))

vi.mock("../../services/tiers", () => ({
  fetchTiers: vi.fn().mockResolvedValue([]),
}))

vi.mock("../../services/messagingSocket", () => ({
  messagingSocket: {
    on: vi.fn(),
    off: vi.fn(),
    joinConversation: vi.fn(),
    leaveConversation: vi.fn(),
    isConnected: vi.fn(() => false),
  },
}))

vi.mock("../../hooks/useConversationThread", () => ({
  useConversationThread: () => mockThread,
}))

import { getConversation, listConversations } from "../../services/messaging"

let mockThread: ConversationThread

function makeThread(): ConversationThread {
  return {
    messages: [],
    tempMessages: [],
    hasMore: false,
    loading: false,
    loadingOlder: false,
    error: null,
    loaded: true,
    send: vi.fn(),
    retry: vi.fn(),
    loadOlder: vi.fn(),
    reload: vi.fn(),
  }
}

const summaries = {
  data: [
    {
      id: "c1",
      member: { id: "m1", name: "Membro Teste", email: "membro@test.com" },
      lastMessagePreview: "Olá artista!",
      lastMessageSenderId: "m1",
      lastMessageAt: "2026-01-01T12:00:00.000Z",
      artistUnreadCount: 1,
      effectiveTier: { id: "t-gold", name: "Gold", priority: 5 },
      accessStatus: "ACTIVE",
      accessExpiresAt: null,
      accessPermanent: true,
    },
  ],
  page: 1,
  limit: 20,
  total: 1,
  totalPages: 1,
}

describe("ArtistMessagesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockThread = makeThread()
    vi.mocked(listConversations).mockResolvedValue(summaries as never)
    vi.mocked(getConversation).mockResolvedValue({
      id: "c1",
      memberId: "m1",
      artistId: "a1",
      memberLastReadAt: null,
      artistLastReadAt: null,
      lastMessageAt: "2026-01-01T12:00:00.000Z",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      artist: { id: "a1", name: "Artista" },
      member: { id: "m1", name: "Membro Teste", email: "membro@test.com" },
      memberEffectiveTier: { id: "t-gold", name: "Gold", priority: 5 },
      accessStatus: "ACTIVE",
      accessExpiresAt: null,
      accessPermanent: true,
      memberUnread: 0,
      artistUnread: 0,
    } as never)
  })

  it("renders the conversation list with member and tier info", async () => {
    render(<ArtistMessagesPage />)

    expect(await screen.findByText("Membro Teste")).toBeInTheDocument()
    expect(screen.getByText("membro@test.com")).toBeInTheDocument()
    expect(screen.getByText("Gold")).toBeInTheDocument()
  })

  it("opens the selected conversation and shows the thread", async () => {
    const user = userEvent.setup()
    render(<ArtistMessagesPage />)

    await screen.findByText("Membro Teste")

    await user.click(
      screen.getByRole("button", { name: "Conversa com Membro Teste" }),
    )

    expect(getConversation).toHaveBeenCalledWith("c1")
    await waitFor(() => {
      expect(screen.getByLabelText("Mensagem")).toBeInTheDocument()
    })
  })
})

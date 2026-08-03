import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import MemberMessagesPage from "./MemberMessagesPage"
import type { ConversationThread } from "../../hooks/useConversationThread"

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "m1", roles: ["SUBSCRIBER"] } }),
}))

vi.mock("../../services/messaging", () => ({
  getOrCreateConversation: vi.fn(),
  getHistory: vi.fn(),
  sendMessage: vi.fn(),
  markConversationRead: vi.fn(),
  getUnreadCount: vi.fn(),
  listConversations: vi.fn(),
  getConversation: vi.fn(),
}))

vi.mock("../../hooks/useConversationThread", () => ({
  useConversationThread: () => mockThread,
}))

import { getOrCreateConversation } from "../../services/messaging"

let mockThread: ConversationThread

function makeThread(overrides: Partial<ConversationThread> = {}): ConversationThread {
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
    ...overrides,
  }
}

const conversation = {
  id: "c1",
  memberId: "m1",
  artistId: "a1",
  memberLastReadAt: null,
  artistLastReadAt: null,
  lastMessageAt: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  artist: { id: "a1", name: "Artista" },
  member: { id: "m1", name: "Membro" },
}

describe("MemberMessagesPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockThread = makeThread()
    vi.mocked(getOrCreateConversation).mockResolvedValue(conversation as never)
  })

  it("renders the artist conversation header, thread and composer", async () => {
    render(<MemberMessagesPage />)

    expect(await screen.findByText("Artista")).toBeInTheDocument()
    expect(screen.getByText(/Conversa privada com a artista/)).toBeInTheDocument()
    expect(screen.getByLabelText("Mensagem")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Enviar" })).toBeInTheDocument()
  })

  it("shows a controlled unavailable state when no artist is configured", async () => {
    vi.mocked(getOrCreateConversation).mockRejectedValue({
      response: { status: 503 },
    })

    render(<MemberMessagesPage />)

    expect(
      await screen.findByText("Mensagens indisponíveis"),
    ).toBeInTheDocument()
  })

  it("shows a controlled error with retry", async () => {
    vi.mocked(getOrCreateConversation)
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce(conversation as never)

    const user = userEvent.setup()
    render(<MemberMessagesPage />)

    expect(
      await screen.findByText("Não foi possível abrir as mensagens."),
    ).toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: "Tentar novamente" }))

    await waitFor(() => {
      expect(screen.getByText("Artista")).toBeInTheDocument()
    })
  })
})

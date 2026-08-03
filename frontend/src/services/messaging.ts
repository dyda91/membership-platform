import api from "./api"

export interface ConversationSummary {
  id: string
  member: { id: string; name: string | null; email: string }
  lastMessagePreview: string
  lastMessageSenderId: string | null
  lastMessageAt: string | null
  artistUnreadCount: number
  effectiveTier: { id: string; name: string; priority: number } | null
  accessStatus: string
  accessExpiresAt: string | null
  accessPermanent: boolean
}

export interface MemberConversation {
  id: string
  memberId: string
  artistId: string
  memberLastReadAt: string | null
  artistLastReadAt: string | null
  lastMessageAt: string | null
  createdAt: string
  updatedAt: string
  artist: { id: string; name: string | null }
  member: { id: string; name: string | null }
}

export interface ConversationDetail extends MemberConversation {
  member: { id: string; name: string | null; email: string }
  memberEffectiveTier: { id: string; name: string; priority: number } | null
  accessStatus: string
  accessExpiresAt: string | null
  accessPermanent: boolean
  memberUnread: number
  artistUnread: number
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  content: string
  createdAt: string
}

export interface HistoryPage {
  messages: Message[]
  nextCursor: string | null
  hasMore: boolean
}

export interface InboxResponse {
  data: ConversationSummary[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface InboxQuery {
  search?: string
  unread?: boolean
  tierId?: string
  accessStatus?: string
  sort?: "priority" | "recent" | "unread" | "tier"
  page?: number
  limit?: number
}

export async function getOrCreateConversation(): Promise<MemberConversation> {
  const response = await api.get<MemberConversation>("/messages/conversation")

  return response.data
}

export async function listConversations(
  query: InboxQuery = {},
): Promise<InboxResponse> {
  const response = await api.get<InboxResponse>("/messages/conversations", {
    params: query,
  })

  return response.data
}

export async function getConversation(
  conversationId: string,
): Promise<ConversationDetail> {
  const response = await api.get<ConversationDetail>(
    `/messages/conversations/${conversationId}`,
  )

  return response.data
}

export async function getHistory(
  conversationId: string,
  query: { before?: string | null; limit?: number } = {},
): Promise<HistoryPage> {
  const response = await api.get<HistoryPage>(
    `/messages/conversations/${conversationId}/messages`,
    { params: { before: query.before ?? undefined, limit: query.limit } },
  )

  return response.data
}

export async function sendMessage(
  conversationId: string,
  content: string,
): Promise<Message> {
  const response = await api.post<Message>(
    `/messages/conversations/${conversationId}/messages`,
    { content },
  )

  return response.data
}

export async function markConversationRead(
  conversationId: string,
): Promise<{ memberUnread: number; artistUnread: number }> {
  const response = await api.post<{ memberUnread: number; artistUnread: number }>(
    `/messages/conversations/${conversationId}/read`,
  )

  return response.data
}

export async function getUnreadCount(): Promise<{ count: number }> {
  const response = await api.get<{ count: number }>("/messages/unread-count")

  return response.data
}

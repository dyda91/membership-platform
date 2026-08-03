import { useCallback, useEffect, useState } from "react"
import type { AxiosError } from "axios"

import { useAuth } from "../../contexts/AuthContext"
import { useConversationThread } from "../../hooks/useConversationThread"
import { getOrCreateConversation } from "../../services/messaging"
import type { MemberConversation } from "../../services/messaging"
import PageContainer from "../../components/ui/PageContainer"
import Card from "../../components/ui/Card"
import Skeleton from "../../components/ui/Skeleton"
import EmptyState from "../../components/ui/EmptyState"
import Alert from "../../components/ui/Alert"
import Button from "../../components/ui/Button"
import Avatar from "../../components/ui/Avatar"
import MessageThread from "../../components/messaging/MessageThread"
import MessageComposer from "../../components/messaging/MessageComposer"

export default function MemberMessagesPage() {
  const { user } = useAuth()
  const [conversation, setConversation] = useState<MemberConversation | null>(
    null,
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [unavailable, setUnavailable] = useState(false)

  const thread = useConversationThread(conversation?.id ?? "")

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    setUnavailable(false)

    try {
      const data = await getOrCreateConversation()
      setConversation(data)
    } catch (requestError) {
      const status = (requestError as AxiosError)?.response?.status

      if (status === 503) {
        setUnavailable(true)
      } else {
        setError("Não foi possível abrir as mensagens.")
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  if (loading) {
    return (
      <PageContainer width="standard">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="mt-4 h-[50vh] w-full" />
      </PageContainer>
    )
  }

  if (unavailable) {
    return (
      <PageContainer width="standard">
        <EmptyState
          title="Mensagens indisponíveis"
          description="A artista ainda não está disponível para mensagens. Tente novamente mais tarde."
          action={
            <Button variant="outline" onClick={() => void load()}>
              Tentar novamente
            </Button>
          }
        />
      </PageContainer>
    )
  }

  if (error || !conversation) {
    return (
      <PageContainer width="standard">
        <Alert variant="error">{error ?? "Não foi possível abrir as mensagens."}</Alert>
        <Button variant="outline" className="mt-4" onClick={() => void load()}>
          Tentar novamente
        </Button>
      </PageContainer>
    )
  }

  return (
    <PageContainer width="standard" className="h-[calc(100dvh-5rem)]">
      <div className="flex h-[calc(100dvh-10rem)] flex-col">
        <Card className="flex h-full flex-col overflow-hidden">
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Avatar
              url={null}
              name={conversation.artist.name}
              size="sm"
              ariaLabel={conversation.artist.name ?? "Artista"}
            />
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold text-foreground">
                {conversation.artist.name ?? "Artista"}
              </h1>
              <p className="text-xs text-foreground-muted">
                Conversa privada com a artista
              </p>
            </div>
          </div>

          {thread.error ? (
            <div className="p-4">
              <Alert variant="error">{thread.error}</Alert>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={thread.reload}
              >
                Tentar novamente
              </Button>
            </div>
          ) : (
            <MessageThread thread={thread} currentUserId={user?.id ?? ""} />
          )}

          <MessageComposer thread={thread} />
        </Card>
      </div>
    </PageContainer>
  )
}

import { useEffect, useRef } from "react"

import type { Message } from "../../services/messaging"
import type { ConversationThread } from "../../hooks/useConversationThread"
import Button from "../ui/Button"
import Skeleton from "../ui/Skeleton"

interface MessageThreadProps {
  thread: ConversationThread
  currentUserId: string
}

function formatTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return ""
  }

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function MessageBubble({
  message,
  mine,
}: {
  message: Message
  mine: boolean
}) {
  return (
    <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
      <div
        className={
          mine
            ? "max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3.5 py-2 text-primary-foreground"
            : "max-w-[85%] rounded-2xl rounded-bl-sm border border-border bg-surface px-3.5 py-2 text-foreground"
        }
      >
        <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
        <time className="mt-0.5 block text-right text-[10px] opacity-70">
          {formatTime(message.createdAt)}
        </time>
      </div>
    </div>
  )
}

export default function MessageThread({
  thread,
  currentUserId,
}: MessageThreadProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null)
  const firstRender = useRef(true)

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false

      return
    }

    bottomRef.current?.scrollIntoView({ block: "end" })
  }, [thread.messages.length])

  if (thread.loading) {
    return (
      <div className="space-y-3 p-4">
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-12 w-2/3" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto px-4 py-3">
      {thread.hasMore && (
        <div className="mb-3 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={thread.loadOlder}
            loading={thread.loadingOlder}
          >
            Carregar mensagens anteriores
          </Button>
        </div>
      )}

      <div className="space-y-2.5">
        {thread.messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            mine={message.senderId === currentUserId}
          />
        ))}

        {thread.tempMessages.map((temp) => (
          <div key={temp.localId} className="flex justify-end">
            <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary/80 px-3.5 py-2 text-primary-foreground">
              <p className="whitespace-pre-wrap break-words text-sm">
                {temp.content}
              </p>
              <p className="mt-0.5 text-right text-[10px] opacity-80">
                {temp.status === "sending" ? "Enviando…" : "Falha no envio"}
              </p>
              {temp.status === "failed" && (
                <div className="mt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => thread.retry(temp.localId, temp.content)}
                  >
                    Tentar novamente
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div ref={bottomRef} />
    </div>
  )
}

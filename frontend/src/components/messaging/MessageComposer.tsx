import { useState } from "react"
import type { KeyboardEvent } from "react"

import type { ConversationThread } from "../../hooks/useConversationThread"
import Button from "../ui/Button"
import Textarea from "../ui/Textarea"

const MAX_LENGTH = 4000

interface MessageComposerProps {
  thread: ConversationThread
}

export default function MessageComposer({ thread }: MessageComposerProps) {
  const [content, setContent] = useState("")
  const sending = thread.tempMessages.some((item) => item.status === "sending")

  function handleSend() {
    const trimmed = content.trim()

    if (trimmed.length === 0 || sending) {
      return
    }

    thread.send(trimmed)
    setContent("")
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-border bg-surface p-3">
      <div className="flex items-end gap-2">
        <Textarea
          aria-label="Mensagem"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escreva uma mensagem…"
          rows={2}
          maxLength={MAX_LENGTH}
          className="flex-1 resize-none"
        />
        <Button
          onClick={handleSend}
          disabled={content.trim().length === 0 || sending}
        >
          Enviar
        </Button>
      </div>
      <p className="mt-1 text-right text-xs text-foreground-muted">
        {content.length}/{MAX_LENGTH} · Enter envia, Shift+Enter quebra linha
      </p>
    </div>
  )
}

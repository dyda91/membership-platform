import { useCallback, useEffect, useState } from "react"

import { useAuth } from "../../contexts/AuthContext"
import { useMediaQuery } from "../../hooks/useMediaQuery"
import { useConversationThread } from "../../hooks/useConversationThread"
import {
  getConversation,
  listConversations,
} from "../../services/messaging"
import type {
  ConversationDetail,
  ConversationSummary,
  InboxQuery,
} from "../../services/messaging"
import { messagingSocket } from "../../services/messagingSocket"
import { fetchTiers } from "../../services/tiers"
import type { Tier } from "../../services/tiers"
import PageHeader from "../../components/ui/PageHeader"
import Card from "../../components/ui/Card"
import Input from "../../components/ui/Input"
import Select from "../../components/ui/Select"
import Button from "../../components/ui/Button"
import Badge from "../../components/ui/Badge"
import Skeleton from "../../components/ui/Skeleton"
import EmptyState from "../../components/ui/EmptyState"
import Alert from "../../components/ui/Alert"
import IconButton from "../../components/ui/IconButton"
import Avatar from "../../components/ui/Avatar"
import { IconChevronLeft } from "../../components/ui/Icons"
import { useRightPanel } from "../../components/layout/right-panel/RightPanelContext"
import ConversationSidePanel from "../../components/layout/right-panel/ConversationSidePanel"
import ConversationListItem from "../../components/messaging/ConversationListItem"
import MessageThread from "../../components/messaging/MessageThread"
import MessageComposer from "../../components/messaging/MessageComposer"
import { ACCESS_STATUS_LABELS } from "../../components/ui/status-labels"

const PAGE_SIZE = 20

export default function ArtistMessagesPage() {
  const { user, isSuperAdmin } = useAuth()
  const readOnly = isSuperAdmin
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchInput, setSearchInput] = useState("")
  const [query, setQuery] = useState<InboxQuery>({ page: 1, limit: PAGE_SIZE })
  const [tiers, setTiers] = useState<Tier[]>([])

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<ConversationDetail | null>(null)

  const thread = useConversationThread(selectedId ?? "")
  const { setContent, clearContent } = useRightPanel()

  useEffect(() => {
    setContent(<ConversationSidePanel detail={detail} />)

    return clearContent
  }, [detail, setContent, clearContent])

  useEffect(() => {
    fetchTiers()
      .then(setTiers)
      .catch(() => undefined)
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await listConversations(query)
      setConversations(data.data)
      setTotal(data.total)
    } catch {
      setError("Não foi possível carregar as conversas.")
    } finally {
      setLoading(false)
    }
  }, [query])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!selectedId) {
      setDetail(null)

      return
    }

    getConversation(selectedId)
      .then(setDetail)
      .catch(() => undefined)
  }, [selectedId])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined

    const handleUpdated = () => {
      if (timer) {
        clearTimeout(timer)
      }

      timer = setTimeout(() => void load(), 400)
    }

    messagingSocket.on("conversation:updated", handleUpdated)

    return () => {
      if (timer) {
        clearTimeout(timer)
      }

      messagingSocket.off("conversation:updated", handleUpdated)
    }
  }, [load])

  function applySearch() {
    setQuery((current) => ({
      ...current,
      search: searchInput.trim() || undefined,
      page: 1,
    }))
  }

  function updateQuery(patch: Partial<InboxQuery>) {
    setQuery((current) => ({ ...current, ...patch, page: 1 }))
  }

  function clearFilters() {
    setSearchInput("")
    setQuery({ page: 1, limit: PAGE_SIZE })
  }

  const hasFilters =
    Boolean(query.search) ||
    Boolean(query.unread) ||
    Boolean(query.tierId) ||
    Boolean(query.accessStatus)

  const selectedSummary = conversations.find(
    (conversation) => conversation.id === selectedId,
  )

  const threadView = (
    <div className="flex h-full flex-col">
      <ConversationPanelHeader
        detail={detail}
        summary={selectedSummary}
        onBack={isDesktop ? undefined : () => setSelectedId(null)}
      />
      {detail && (
        <div className="border-b border-border bg-surface-muted/50 px-4 py-2 text-xs text-foreground-muted">
          {detail.memberEffectiveTier && (
            <Badge variant="primary" className="mr-2">
              {detail.memberEffectiveTier.name}
            </Badge>
          )}
          Acesso:{" "}
          {ACCESS_STATUS_LABELS[detail.memberEffectiveTier ? detail.accessStatus : "NONE"] ??
            detail.accessStatus}
        </div>
      )}
      {selectedId ? (
        <>
          <MessageThread thread={thread} currentUserId={user?.id ?? ""} />
          {readOnly ? (
            <div className="border-t border-border bg-surface-muted/60 px-4 py-3 text-center text-xs text-foreground-muted">
              Acesso somente leitura (suporte).
            </div>
          ) : (
            <MessageComposer thread={thread} />
          )}
        </>
      ) : (
        <EmptyState
          title="Nenhuma conversa selecionada"
          description="Escolha uma conversa na lista."
        />
      )}
    </div>
  )

  const sidebar = (
    <div className="flex flex-col">
      <div className="space-y-2 border-b border-border p-3">
        <div className="flex gap-2">
          <Input
            type="search"
            aria-label="Buscar por nome ou e-mail"
            placeholder="Buscar membro…"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                applySearch()
              }
            }}
          />
          <Button onClick={applySearch}>Buscar</Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Select
            aria-label="Filtrar por status de acesso"
            value={query.accessStatus ?? ""}
            onChange={(event) =>
              updateQuery({ accessStatus: event.target.value || undefined })
            }
          >
            <option value="">Todos os acessos</option>
            {["ACTIVE", "EXPIRING_SOON", "PERMANENT", "EXPIRED", "REVOKED", "SCHEDULED", "NONE"].map(
              (status) => (
                <option key={status} value={status}>
                  {ACCESS_STATUS_LABELS[status] ?? status}
                </option>
              ),
            )}
          </Select>

          <Select
            aria-label="Filtrar por tier"
            value={query.tierId ?? ""}
            onChange={(event) =>
              updateQuery({ tierId: event.target.value || undefined })
            }
          >
            <option value="">Todos os tiers</option>
            {tiers.map((tier) => (
              <option key={tier.id} value={tier.id}>
                {tier.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-sm text-foreground">
            <input
              type="checkbox"
              checked={Boolean(query.unread)}
              onChange={(event) => updateQuery({ unread: event.target.checked || undefined })}
            />
            Não lidas
          </label>

          <Select
            aria-label="Ordenar conversas"
            value={query.sort ?? "priority"}
            onChange={(event) =>
              updateQuery({ sort: event.target.value as InboxQuery["sort"] })
            }
            className="flex-1"
          >
            <option value="priority">Prioridade</option>
            <option value="recent">Mais recentes</option>
            <option value="unread">Não lidas</option>
            <option value="tier">Tier</option>
          </Select>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Limpar
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="space-y-2 p-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : error ? (
          <div className="p-2">
            <Alert variant="error">{error}</Alert>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => void load()}>
              Tentar novamente
            </Button>
          </div>
        ) : conversations.length === 0 ? (
          <EmptyState
            className="border-0"
            title="Nenhuma conversa"
            description={
              hasFilters
                ? "Nenhuma conversa corresponde aos filtros."
                : "Quando membros enviarem mensagens, elas aparecerão aqui."
            }
          />
        ) : (
          <ul className="space-y-1">
            {conversations.map((conversation) => (
              <ConversationListItem
                key={conversation.id}
                summary={conversation}
                selected={conversation.id === selectedId}
                onSelect={() => setSelectedId(conversation.id)}
              />
            ))}
          </ul>
        )}
      </div>

      {conversations.length > 0 && (
        <div className="flex items-center justify-between border-t border-border px-3 py-2">
          <span className="text-xs text-foreground-muted">
            {total} conversa(s)
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={(query.page ?? 1) <= 1}
              onClick={() =>
                setQuery((current) => ({
                  ...current,
                  page: (current.page ?? 1) - 1,
                }))
              }
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={(query.page ?? 1) * PAGE_SIZE >= total}
              onClick={() =>
                setQuery((current) => ({
                  ...current,
                  page: (current.page ?? 1) + 1,
                }))
              }
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="mx-auto h-[100dvh] w-full max-w-7xl overflow-hidden">
      <div className="flex h-full flex-col px-4 pt-6 sm:px-6 pb-[calc(56px+env(safe-area-inset-bottom))] lg:pb-8">
        <PageHeader title="Mensagens" description="Caixa de entrada da artista." />

        <div className="mt-4 min-h-0 flex-1">
          {isDesktop ? (
            <div className="grid h-full grid-cols-1 gap-4 lg:grid-cols-[minmax(300px,380px)_1fr]">
              <Card className="min-h-0 overflow-hidden">{sidebar}</Card>
              <Card className="min-h-0 overflow-hidden">{threadView}</Card>
            </div>
          ) : selectedId ? (
            <Card className="h-full overflow-hidden">{threadView}</Card>
          ) : (
            <Card className="h-full overflow-hidden">{sidebar}</Card>
          )}
        </div>
      </div>
    </div>
  )
}

function ConversationPanelHeader({
  detail,
  summary,
  onBack,
}: {
  detail: ConversationDetail | null
  summary: ConversationSummary | undefined
  onBack?: () => void
}) {
  const name = detail?.member.name ?? summary?.member.name ?? "Membro"
  const email = detail?.member.email ?? summary?.member.email ?? ""

  return (
    <div className="flex items-center gap-2 border-b border-border px-4 py-3">
      {onBack && (
        <IconButton
          label="Voltar para a lista"
          variant="ghost"
          icon={<IconChevronLeft />}
          onClick={onBack}
        />
      )}
      <Avatar url={null} name={name} size="sm" ariaLabel={name} />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-foreground">{name}</p>
        {email && <p className="truncate text-xs text-foreground-muted">{email}</p>}
      </div>
    </div>
  )
}

import { useCallback, useEffect, useMemo, useState } from "react"
import type { FormEvent } from "react"
import type { AxiosError } from "axios"

import {
  ACCOUNT_STATUSES,
  fetchUser,
  fetchUsers,
} from "../../services/users"
import type {
  AccountStatus,
  Role,
  User,
  UserListQuery,
} from "../../services/users"
import {
  applyAccessToUser,
  fetchTierAccess,
  fetchTierAccessHistory,
  grantTierAccess,
  renewTierAccess,
  revokeTierAccess,
  updateTierAccess,
} from "../../services/tier-access"
import type {
  TierAccessHistoryEvent,
  TierAccessStatus,
} from "../../services/tier-access"
import { fetchTiers } from "../../services/tiers"
import type { Tier } from "../../services/tiers"
import { useAuth } from "../../contexts/AuthContext"
import PageContainer from "../../components/ui/PageContainer"
import PageHeader from "../../components/ui/PageHeader"
import Card from "../../components/ui/Card"
import Field from "../../components/ui/Field"
import Input from "../../components/ui/Input"
import Select from "../../components/ui/Select"
import Checkbox from "../../components/ui/Checkbox"
import Button from "../../components/ui/Button"
import Alert from "../../components/ui/Alert"
import EmptyState from "../../components/ui/EmptyState"
import Dialog from "../../components/ui/Dialog"
import Badge from "../../components/ui/Badge"
import {
  AccessStatusBadge,
  AccountStatusBadge,
  RoleBadge,
} from "../../components/ui/status-badges"

const PAGE_SIZE = 10

function errorMessage(error: unknown) {
  const status = (error as AxiosError)?.response?.status

  if (status === 401) {
    return "Sua sessão expirou. Faça login novamente."
  }

  if (status === 403) {
    return "Usuário sem permissão para acessar este recurso."
  }

  return "Não foi possível processar a solicitação. Tente novamente."
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR")
}

export default function UsersAdminPage() {
  const { user: sessionUser } = useAuth()
  const isSuperAdmin = sessionUser?.isSuperAdmin ?? false

  const [users, setUsers] = useState<User[]>([])
  const [tiers, setTiers] = useState<Tier[]>([])
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [tierFilter, setTierFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [accessFilter, setAccessFilter] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingTiers, setLoadingTiers] = useState(true)
  const [tierError, setTierError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<User | null>(null)

  const query: UserListQuery = useMemo(
    () => ({
      search: search || undefined,
      tierId: tierFilter || undefined,
      status: (statusFilter as AccountStatus) || undefined,
      role: (roleFilter as Role) || undefined,
      accessStatus: accessFilter || undefined,
      page,
      limit: PAGE_SIZE,
    }),
    [search, tierFilter, statusFilter, roleFilter, accessFilter, page],
  )

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await fetchUsers(query)
      setUsers(data.data)
      setTotalPages(data.totalPages)
      setTotal(data.total)
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }, [query])

  const loadTiers = useCallback(async () => {
    setLoadingTiers(true)
    setTierError(null)

    try {
      const data = await fetchTiers()
      setTiers(data)
    } catch {
      setTierError("Não foi possível carregar os tiers.")
    } finally {
      setLoadingTiers(false)
    }
  }, [])

  useEffect(() => {
    void loadTiers()
  }, [loadTiers])

  useEffect(() => {
    void loadUsers()
  }, [loadUsers])

  function applySearch() {
    setSearch(searchInput.trim())
    setPage(1)
  }

  function resetPageForFilter() {
    setPage(1)
  }

  function clearFilters() {
    setSearchInput("")
    setSearch("")
    setTierFilter("")
    setStatusFilter("")
    setRoleFilter("")
    setAccessFilter("")
    setPage(1)
  }

  function handleUpdated(updated: User) {
    setUsers((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    )
    setSelected(updated)
  }

  return (
    <PageContainer width="wide">
      <PageHeader
        title="Gerenciamento de Usuários"
        description="Localize membros, atribua tiers e gerencie o acesso."
      />

      {error && (
        <div className="mb-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <Card className="p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <div className="sm:col-span-2">
            <Input
              type="search"
              aria-label="Buscar por nome ou e-mail"
              placeholder="Buscar por nome ou e-mail"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  applySearch()
                }
              }}
            />
          </div>

          <div>
            <Select
              aria-label="Filtrar por tier"
              value={tierFilter}
              onChange={(event) => {
                setTierFilter(event.target.value)
                resetPageForFilter()
              }}
            >
              <option value="">Todos os tiers</option>
              {tiers.map((tier) => (
                <option key={tier.id} value={tier.id}>
                  {tier.name} (prioridade {tier.priority})
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Select
              aria-label="Filtrar por status da conta"
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value)
                resetPageForFilter()
              }}
            >
              <option value="">Todos os status</option>
              <option value={ACCOUNT_STATUSES.ACTIVE}>Ativo</option>
              <option value={ACCOUNT_STATUSES.DISABLED}>Desativado</option>
            </Select>
          </div>

          <div>
            <Select
              aria-label="Filtrar por acesso"
              value={accessFilter}
              onChange={(event) => {
                setAccessFilter(event.target.value)
                resetPageForFilter()
              }}
            >
              <option value="">Todos os acessos</option>
              <option value="ACTIVE">Ativo</option>
              <option value="EXPIRING_SOON">Expirando em breve</option>
              <option value="EXPIRED">Expirado</option>
              <option value="PERMANENT">Permanente</option>
              <option value="SCHEDULED">Agendado</option>
              <option value="REVOKED">Revogado</option>
              <option value="NONE">Sem acesso</option>
            </Select>
          </div>

          <div>
            <Select
              aria-label="Filtrar por role"
              value={roleFilter}
              onChange={(event) => {
                setRoleFilter(event.target.value)
                resetPageForFilter()
              }}
              disabled={!isSuperAdmin}
            >
              <option value="">Todas as roles</option>
              <option value="SUBSCRIBER">Assinante</option>
              <option value="ARTIST">Artista</option>
            </Select>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={applySearch}>Buscar</Button>
          <Button variant="outline" onClick={clearFilters}>
            Limpar busca e filtros
          </Button>
        </div>
      </Card>

      {tierError && (
        <div className="mt-4">
          <Alert
            variant="warning"
            action={
              <button
                type="button"
                onClick={() => void loadTiers()}
                className="shrink-0 text-sm font-medium underline"
              >
                Tentar novamente
              </button>
            }
          >
            {tierError}
          </Alert>
        </div>
      )}

      <div className="mt-6 overflow-hidden rounded-lg border border-border bg-surface shadow-card">
        {loading ? (
          <p className="p-6 text-sm text-foreground-muted">Carregando usuários...</p>
        ) : users.length === 0 ? (
          <EmptyState
            className="m-4 border-0"
            title="Nenhum usuário encontrado"
            description="Ajuste a busca ou limpe os filtros para ver mais resultados."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-surface-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
                    Acesso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
                    Criado em
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wide text-foreground-muted">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-surface-muted">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {user.name || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground-muted">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground-muted">
                      <div className="flex flex-wrap gap-1.5">
                        {user.roles.map((role) => (
                          <RoleBadge key={role} role={role} />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground-muted">
                      {user.tierAccess?.tier?.name ?? user.tier?.name ?? "Gratuito"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <AccessStatusBadge
                        status={(user.tierAccess?.status ?? "NONE") as TierAccessStatus}
                      />
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <AccountStatusBadge status={user.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground-muted">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelected(user)}
                      >
                        Gerenciar acesso
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-foreground-muted">
          Página {page} de {totalPages || 1} · {total} usuário(s)
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || totalPages === 0}
            onClick={() => setPage((current) => current + 1)}
          >
            Próxima
          </Button>
        </div>
      </div>

      {selected && (
        <AccessDialog
          user={selected}
          tiers={tiers}
          loadingTiers={loadingTiers}
          tierError={tierError}
          isSuperAdmin={isSuperAdmin}
          onRetryTiers={() => void loadTiers()}
          onClose={() => setSelected(null)}
          onUpdated={handleUpdated}
        />
      )}
    </PageContainer>
  )
}

interface AccessDialogProps {
  user: User
  tiers: Tier[]
  loadingTiers: boolean
  tierError: string | null
  isSuperAdmin: boolean
  onRetryTiers: () => void
  onClose: () => void
  onUpdated: (user: User) => void
}

const ACTION_LABELS: Record<string, string> = {
  GRANTED: "Concedido",
  RENEWED: "Renovado",
  TIER_CHANGED: "Tier alterado",
  DATES_CHANGED: "Datas alteradas",
  REVOKED: "Revogado",
  RESTORED: "Restaurado",
  MIGRATED: "Migrado",
}

function localDateInput(value: string | null | undefined): string {
  if (!value) {
    return ""
  }

  const d = new Date(value)

  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")

  return `${y}-${m}-${day}`
}

function toUtcEndOfDay(value: string): string {
  return `${value}T23:59:59.000Z`
}

function AccessDialog({
  user,
  tiers,
  loadingTiers,
  tierError,
  isSuperAdmin,
  onRetryTiers,
  onClose,
  onUpdated,
}: AccessDialogProps) {
  const [access, setAccess] = useState(user.tierAccess ?? null)
  const [tierId, setTierId] = useState<string>(
    user.tierAccess?.tier?.id ?? user.tierId ?? "",
  )
  const [startsAt, setStartsAt] = useState<string>(
    localDateInput(user.tierAccess?.startsAt) || new Date().toISOString().slice(0, 10),
  )
  const [expiresAt, setExpiresAt] = useState<string>(
    localDateInput(user.tierAccess?.expiresAt),
  )
  const [permanent, setPermanent] = useState<boolean>(
    user.tierAccess?.permanent ?? false,
  )
  const [internalNote, setInternalNote] = useState("")
  const [renewExpiresAt, setRenewExpiresAt] = useState("")
  const [revokeNote, setRevokeNote] = useState("")
  const [confirmRevoke, setConfirmRevoke] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<TierAccessHistoryEvent[] | null>(null)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function reloadAccess() {
    const summary = await fetchTierAccess(user.id)
    setAccess(summary)
    setTierId(summary.tier?.id ?? "")
    setStartsAt(localDateInput(summary.startsAt) || new Date().toISOString().slice(0, 10))
    setExpiresAt(localDateInput(summary.expiresAt))
    setPermanent(summary.permanent)
  }

  function validateDates() {
    if (!startsAt) {
      return "Informe a data de início."
    }

    if (!permanent && !expiresAt) {
      return "Informe a data de expiração ou marque acesso permanente."
    }

    if (!permanent && expiresAt && expiresAt <= startsAt) {
      return "A data de expiração deve ser posterior ao início."
    }

    return null
  }

  async function handleGrant(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    const invalid = validateDates()

    if (invalid) {
      setError(invalid)

      return
    }

    setBusy(true)

    try {
      await grantTierAccess(user.id, {
        tierId,
        startsAt: `${startsAt}T00:00:00.000Z`,
        expiresAt: permanent ? null : toUtcEndOfDay(expiresAt),
        permanent,
        internalNote: internalNote || undefined,
      })
      const updated = await fetchUserWithAccess(user.id)
      onUpdated(updated)
      await reloadAccess()
      setSuccess("Acesso concedido com sucesso.")
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setBusy(false)
    }
  }

  async function handleRenew() {
    setError(null)
    setSuccess(null)

    if (!renewExpiresAt) {
      setError("Informe a nova data de expiração.")

      return
    }

    setBusy(true)

    try {
      await renewTierAccess(user.id, {
        expiresAt: toUtcEndOfDay(renewExpiresAt),
        permanent: false,
        internalNote: internalNote || undefined,
      })
      const updated = await fetchUserWithAccess(user.id)
      onUpdated(updated)
      await reloadAccess()
      setRenewExpiresAt("")
      setSuccess("Acesso renovado com sucesso.")
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setBusy(false)
    }
  }

  async function handleRevoke() {
    setError(null)
    setSuccess(null)
    setBusy(true)

    try {
      await revokeTierAccess(user.id, revokeNote || undefined)
      const updated = await fetchUserWithAccess(user.id)
      onUpdated(updated)
      await reloadAccess()
      setConfirmRevoke(false)
      setRevokeNote("")
      setSuccess("Acesso revogado.")
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setBusy(false)
    }
  }

  async function handleSaveChanges() {
    setError(null)
    setSuccess(null)

    const invalid = validateDates()

    if (invalid) {
      setError(invalid)

      return
    }

    setBusy(true)

    try {
      await updateTierAccess(user.id, {
        tierId: tierId || undefined,
        startsAt: `${startsAt}T00:00:00.000Z`,
        expiresAt: permanent ? null : toUtcEndOfDay(expiresAt),
        permanent,
        internalNote: internalNote || undefined,
      })
      const updated = await fetchUserWithAccess(user.id)
      onUpdated(updated)
      await reloadAccess()
      setSuccess("Acesso atualizado com sucesso.")
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setBusy(false)
    }
  }

  async function handleToggleHistory() {
    if (!showHistory) {
      setLoadingHistory(true)
      setError(null)

      try {
        const data = await fetchTierAccessHistory(user.id)
        setHistory(data)
      } catch (requestError) {
        setError(errorMessage(requestError))
      } finally {
        setLoadingHistory(false)
      }
    }

    setShowHistory((current) => !current)
  }

  const accessStatus: TierAccessStatus = access?.status ?? "NONE"

  return (
    <Dialog
      open
      onClose={onClose}
      title="Gerenciar acesso"
      description={user.email}
      size="md"
      footer={
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <span className="block text-sm font-medium text-foreground">Role</span>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {user.roles.map((role) => (
              <RoleBadge key={role} role={role} />
            ))}
          </div>
          <p className="mt-1 text-xs text-foreground-muted">
            {isSuperAdmin
              ? "Role atribuída. A atribuição de ARTIST/SUPER_ADMIN é separada e restrita."
              : "Role somente leitura."}
          </p>
        </div>

        <div className="rounded-md border border-border p-3">
          <span className="block text-sm font-medium text-foreground">
            Acesso atual
          </span>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-sm text-foreground">
              {access?.tier?.name ?? "Gratuito"}
            </span>
            <AccessStatusBadge status={accessStatus} />
            {access?.expiresAt && (
              <span className="text-xs text-foreground-muted">
                até {formatDate(access.expiresAt)}
              </span>
            )}
            {access?.permanent && (
              <Badge variant="accent">Acesso permanente</Badge>
            )}
          </div>
        </div>

        <form onSubmit={handleGrant} className="space-y-3">
          <Field id="tierId" label="Tier de acesso">
            {loadingTiers ? (
              <p className="text-sm text-foreground-muted">Carregando tiers...</p>
            ) : tierError ? (
              <div>
                <p className="text-sm text-warning-foreground">{tierError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRetryTiers}
                  className="mt-1"
                >
                  Tentar novamente
                </Button>
              </div>
            ) : (
              <Select
                id="tierId"
                data-testid="tier-select"
                value={tierId}
                onChange={(event) => setTierId(event.target.value)}
                disabled={busy}
              >
                <option value="">Gratuito (sem tier)</option>
                {tiers.map((tier) => (
                  <option key={tier.id} value={tier.id}>
                    {tier.name} · prioridade {tier.priority}
                  </option>
                ))}
              </Select>
            )}
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field id="startsAt" label="Início">
              <Input
                id="startsAt"
                type="date"
                value={startsAt}
                onChange={(event) => setStartsAt(event.target.value)}
                disabled={busy}
              />
            </Field>
            <Field id="expiresAt" label="Expiração">
              <Input
                id="expiresAt"
                type="date"
                value={expiresAt}
                onChange={(event) => setExpiresAt(event.target.value)}
                disabled={busy || permanent}
              />
            </Field>
          </div>

          <Checkbox
            id="permanent"
            label="Acesso permanente"
            checked={permanent}
            onChange={(event) => setPermanent(event.target.checked)}
            disabled={busy}
          />

          <Field id="internalNote" label="Observação interna">
            <Input
              id="internalNote"
              type="text"
              value={internalNote}
              onChange={(event) => setInternalNote(event.target.value)}
              placeholder="Ex.: pagamento confirmado via WhatsApp"
            />
          </Field>

          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              loading={busy}
              disabled={loadingTiers}
            >
              {busy ? "Salvando..." : "Conceder / salvar"}
            </Button>
            {access && accessStatus !== "NONE" && accessStatus !== "REVOKED" && (
              <>
                <Button
                  variant="success"
                  onClick={() => void handleRenew()}
                  disabled={busy}
                >
                  Renovar
                </Button>
                <Button
                  variant="danger"
                  onClick={() => setConfirmRevoke(true)}
                  disabled={busy}
                >
                  Revogar
                </Button>
              </>
            )}
            {access && accessStatus !== "NONE" && (
              <Button
                variant="warning"
                onClick={() => void handleSaveChanges()}
                disabled={busy}
              >
                Salvar alterações
              </Button>
            )}
          </div>

          {accessStatus !== "NONE" && accessStatus !== "REVOKED" && (
            <Field id="renewExpiresAt" label="Nova expiração (renovar)">
              <Input
                id="renewExpiresAt"
                type="date"
                value={renewExpiresAt}
                onChange={(event) => setRenewExpiresAt(event.target.value)}
              />
            </Field>
          )}
        </form>

        {confirmRevoke && (
          <div className="rounded-md border border-danger/30 bg-danger-muted/40 p-3">
            <p className="text-sm font-medium text-danger-foreground">
              Confirmar revogação do acesso?
            </p>
            <Input
              type="text"
              value={revokeNote}
              onChange={(event) => setRevokeNote(event.target.value)}
              placeholder="Motivo opcional"
              className="mt-2"
            />
            <div className="mt-2 flex gap-2">
              <Button
                variant="danger"
                size="sm"
                onClick={() => void handleRevoke()}
                loading={busy}
              >
                Sim, revogar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmRevoke(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {error && <Alert variant="error">{error}</Alert>}

        {success && <Alert variant="success">{success}</Alert>}

        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleToggleHistory()}
          >
            {showHistory ? "Ocultar histórico" : "Ver histórico de acesso"}
          </Button>

          {showHistory && (
            <div className="mt-3">
              {loadingHistory ? (
                <p className="text-sm text-foreground-muted">
                  Carregando histórico...
                </p>
              ) : history && history.length > 0 ? (
                <ul className="divide-y divide-border rounded-md border border-border">
                  {history.map((event) => (
                    <li key={event.id} className="p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {ACTION_LABELS[event.action] ?? event.action}
                        </span>
                        <span className="shrink-0 text-xs text-foreground-muted">
                          {formatDate(event.createdAt)}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-foreground-muted">
                        {event.newTier?.name ?? event.previousTier?.name ?? "—"}
                        {event.newExpiresAt && (
                          <span> · válido até {formatDate(event.newExpiresAt)}</span>
                        )}
                        {event.actor?.email && (
                          <span> · por {event.actor.email}</span>
                        )}
                      </div>
                      {event.internalNote && (
                        <div className="mt-1 text-xs italic text-foreground-muted">
                          Nota: {event.internalNote}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-foreground-muted">
                  Nenhum evento de acesso registrado.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  )
}

async function fetchUserWithAccess(userId: string): Promise<User> {
  const [user, access] = await Promise.all([
    fetchUser(userId),
    fetchTierAccess(userId),
  ])

  return applyAccessToUser(user, access)
}

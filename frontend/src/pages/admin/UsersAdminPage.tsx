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

const PAGE_SIZE = 10

const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  ARTIST: "Artista",
  SUBSCRIBER: "Assinante",
}

const STATUS_LABELS: Record<AccountStatus, string> = {
  ACTIVE: "Ativo",
  DISABLED: "Desativado",
}

const ACCESS_STATUS_LABELS: Record<string, string> = {
  NONE: "Sem acesso",
  SCHEDULED: "Agendado",
  ACTIVE: "Ativo",
  EXPIRING_SOON: "Expirando",
  EXPIRED: "Expirado",
  REVOKED: "Revogado",
  PERMANENT: "Permanente",
}

const ACCESS_STATUS_STYLES: Record<string, string> = {
  NONE: "bg-gray-100 text-gray-600",
  SCHEDULED: "bg-blue-100 text-blue-700",
  ACTIVE: "bg-green-100 text-green-700",
  EXPIRING_SOON: "bg-amber-100 text-amber-700",
  EXPIRED: "bg-red-100 text-red-700",
  REVOKED: "bg-red-100 text-red-700",
  PERMANENT: "bg-indigo-100 text-indigo-700",
}

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
    <div>
      <h2 className="text-3xl font-bold text-black">
        Gerenciamento de Usuários
      </h2>

      <p className="mt-2 text-gray-600">
        Localize membros, atribua tiers e gerencie o acesso.
      </p>

      {error && (
        <p className="mt-4 rounded bg-red-100 p-3 text-red-700">{error}</p>
      )}

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 shadow">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <div className="sm:col-span-2">
            <input
              type="search"
              placeholder="Buscar por nome ou e-mail"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  applySearch()
                }
              }}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <select
              value={tierFilter}
              onChange={(event) => {
                setTierFilter(event.target.value)
                resetPageForFilter()
              }}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Todos os tiers</option>
              {tiers.map((tier) => (
                <option key={tier.id} value={tier.id}>
                  {tier.name} (prioridade {tier.priority})
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value)
                resetPageForFilter()
              }}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Todos os status</option>
              <option value={ACCOUNT_STATUSES.ACTIVE}>Ativo</option>
              <option value={ACCOUNT_STATUSES.DISABLED}>Desativado</option>
            </select>
          </div>

          <div>
            <select
              value={accessFilter}
              onChange={(event) => {
                setAccessFilter(event.target.value)
                resetPageForFilter()
              }}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Todos os acessos</option>
              <option value="ACTIVE">Ativo</option>
              <option value="EXPIRING_SOON">Expirando em breve</option>
              <option value="EXPIRED">Expirado</option>
              <option value="PERMANENT">Permanente</option>
              <option value="SCHEDULED">Agendado</option>
              <option value="REVOKED">Revogado</option>
              <option value="NONE">Sem acesso</option>
            </select>
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(event) => {
                setRoleFilter(event.target.value)
                resetPageForFilter()
              }}
              disabled={!isSuperAdmin}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none disabled:opacity-50"
            >
              <option value="">Todas as roles</option>
              <option value="SUBSCRIBER">Assinante</option>
              <option value="ARTIST">Artista</option>
            </select>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={applySearch}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Buscar
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
          >
            Limpar busca e filtros
          </button>
        </div>
      </div>

      {tierError && (
        <p className="mt-4 rounded bg-amber-100 p-3 text-amber-800">
          {tierError}{" "}
          <button
            type="button"
            onClick={() => void loadTiers()}
            className="ml-2 font-medium text-amber-900 underline"
          >
            Tentar novamente
          </button>
        </p>
      )}

      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
        {loading ? (
          <p className="p-6 text-gray-600">Carregando usuários...</p>
        ) : users.length === 0 ? (
          <p className="p-6 text-gray-600">
            Nenhum usuário encontrado com os critérios informados.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Acesso
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                    Criado em
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {user.name || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.roles.map((role) => ROLE_LABELS[role]).join(", ") ||
                        "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.tierAccess?.tier?.name ?? user.tier?.name ?? "Gratuito"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          ACCESS_STATUS_STYLES[user.tierAccess?.status ?? "NONE"]
                        }`}
                      >
                        {ACCESS_STATUS_LABELS[user.tierAccess?.status ?? "NONE"]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          user.status === ACCOUNT_STATUSES.ACTIVE
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {STATUS_LABELS[user.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <button
                        type="button"
                        onClick={() => setSelected(user)}
                        className="rounded bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200"
                      >
                        Gerenciar acesso
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Página {page} de {totalPages || 1} · {total} usuário(s)
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
            className="rounded bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-300 disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            type="button"
            disabled={page >= totalPages || totalPages === 0}
            onClick={() => setPage((current) => current + 1)}
            className="rounded bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-300 disabled:opacity-50"
          >
            Próxima
          </button>
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
    </div>
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
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6 shadow">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Gerenciar acesso
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded px-2 py-1 text-gray-500 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <p className="mt-1 text-sm text-gray-600">{user.email}</p>

        <div className="mt-4 space-y-4">
          <div>
            <span className="block text-sm font-medium text-gray-700">
              Role
            </span>
            <p className="mt-1 text-sm text-gray-900">
              {user.roles.map((role) => ROLE_LABELS[role]).join(", ") || "—"}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {isSuperAdmin
                ? "Role atribuída. A atribuição de ARTIST/SUPER_ADMIN é separada e restrita."
                : "Role somente leitura."}
            </p>
          </div>

          <div className="rounded border border-gray-200 p-3">
            <span className="block text-sm font-medium text-gray-700">
              Acesso atual
            </span>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-900">
                {access?.tier?.name ?? "Gratuito"}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  ACCESS_STATUS_STYLES[accessStatus]
                }`}
              >
                {ACCESS_STATUS_LABELS[accessStatus]}
              </span>
              {access?.expiresAt && (
                <span className="text-xs text-gray-500">
                  até {formatDate(access.expiresAt)}
                </span>
              )}
              {access?.permanent && (
                <span className="text-xs text-indigo-600">
                  Acesso permanente
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleGrant} className="space-y-3">
            <div>
              <span className="block text-sm font-medium text-gray-700">
                Tier de acesso
              </span>
              {loadingTiers ? (
                <p className="mt-1 text-sm text-gray-500">Carregando tiers...</p>
              ) : tierError ? (
                <div className="mt-1">
                  <p className="text-sm text-amber-700">{tierError}</p>
                  <button
                    type="button"
                    onClick={onRetryTiers}
                    className="mt-1 rounded bg-gray-200 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-300"
                  >
                    Tentar novamente
                  </button>
                </div>
              ) : (
                <select
                  data-testid="tier-select"
                  value={tierId}
                  onChange={(event) => setTierId(event.target.value)}
                  disabled={busy}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Gratuito (sem tier)</option>
                  {tiers.map((tier) => (
                    <option key={tier.id} value={tier.id}>
                      {tier.name} · prioridade {tier.priority}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="startsAt"
                  className="block text-sm font-medium text-gray-700"
                >
                  Início
                </label>
                <input
                  id="startsAt"
                  type="date"
                  value={startsAt}
                  onChange={(event) => setStartsAt(event.target.value)}
                  disabled={busy}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="expiresAt"
                  className="block text-sm font-medium text-gray-700"
                >
                  Expiração
                </label>
                <input
                  id="expiresAt"
                  type="date"
                  value={expiresAt}
                  onChange={(event) => setExpiresAt(event.target.value)}
                  disabled={busy || permanent}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={permanent}
                onChange={(event) => setPermanent(event.target.checked)}
                disabled={busy}
              />
              Acesso permanente
            </label>

            <div>
              <label
                htmlFor="internalNote"
                className="block text-sm font-medium text-gray-700"
              >
                Observação interna
              </label>
              <input
                id="internalNote"
                type="text"
                value={internalNote}
                onChange={(event) => setInternalNote(event.target.value)}
                placeholder="Ex.: pagamento confirmado via WhatsApp"
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={busy || loadingTiers}
                className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {busy ? "Salvando..." : "Conceder / salvar"}
              </button>
              {access && accessStatus !== "NONE" && accessStatus !== "REVOKED" && (
                <>
                  <button
                    type="button"
                    onClick={() => void handleRenew()}
                    disabled={busy}
                    className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    Renovar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmRevoke(true)}
                    disabled={busy}
                    className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    Revogar
                  </button>
                </>
              )}
              {access && accessStatus !== "NONE" && (
                <button
                  type="button"
                  onClick={() => void handleSaveChanges()}
                  disabled={busy}
                  className="rounded bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                >
                  Salvar alterações
                </button>
              )}
            </div>

            {accessStatus !== "NONE" && accessStatus !== "REVOKED" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="renewExpiresAt"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Nova expiração (renovar)
                  </label>
                  <input
                    id="renewExpiresAt"
                    type="date"
                    value={renewExpiresAt}
                    onChange={(event) => setRenewExpiresAt(event.target.value)}
                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </form>

          {confirmRevoke && (
            <div className="rounded border border-red-200 bg-red-50 p-3">
              <p className="text-sm font-medium text-red-800">
                Confirmar revogação do acesso?
              </p>
              <input
                type="text"
                value={revokeNote}
                onChange={(event) => setRevokeNote(event.target.value)}
                placeholder="Motivo opcional"
                className="mt-2 w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
              />
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => void handleRevoke()}
                  disabled={busy}
                  className="rounded bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  Sim, revogar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmRevoke(false)}
                  className="rounded bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {error && (
            <p className="rounded bg-red-100 p-3 text-sm text-red-700">
              {error}
            </p>
          )}

          {success && (
            <p className="rounded bg-green-100 p-3 text-sm text-green-700">
              {success}
            </p>
          )}

          <div>
            <button
              type="button"
              onClick={() => void handleToggleHistory()}
              className="rounded bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-300"
            >
              {showHistory ? "Ocultar histórico" : "Ver histórico de acesso"}
            </button>

            {showHistory && (
              <div className="mt-3">
                {loadingHistory ? (
                  <p className="text-sm text-gray-500">Carregando histórico...</p>
                ) : history && history.length > 0 ? (
                  <ul className="divide-y divide-gray-200 rounded border border-gray-200">
                    {history.map((event) => (
                      <li key={event.id} className="p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">
                            {ACTION_LABELS[event.action] ?? event.action}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(event.createdAt)}
                          </span>
                        </div>
                        <div className="mt-1 text-xs text-gray-600">
                          {event.newTier?.name ?? event.previousTier?.name ?? "—"}
                          {event.newExpiresAt && (
                            <span> · válido até {formatDate(event.newExpiresAt)}</span>
                          )}
                          {event.actor?.email && (
                            <span> · por {event.actor.email}</span>
                          )}
                        </div>
                        {event.internalNote && (
                          <div className="mt-1 text-xs italic text-gray-500">
                            Nota: {event.internalNote}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">
                    Nenhum evento de acesso registrado.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

async function fetchUserWithAccess(userId: string): Promise<User> {
  const [user, access] = await Promise.all([
    fetchUser(userId),
    fetchTierAccess(userId),
  ])

  return applyAccessToUser(user, access)
}

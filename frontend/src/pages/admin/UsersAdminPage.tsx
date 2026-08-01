import { useCallback, useEffect, useMemo, useState } from "react"
import type { AxiosError } from "axios"

import {
  ACCOUNT_STATUSES,
  assignUserTier,
  fetchUsers,
} from "../../services/users"
import type {
  AccountStatus,
  Role,
  User,
  UserListQuery,
} from "../../services/users"
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
      page,
      limit: PAGE_SIZE,
    }),
    [search, tierFilter, statusFilter, roleFilter, page],
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

  function clearFilters() {
    setSearchInput("")
    setSearch("")
    setTierFilter("")
    setStatusFilter("")
    setRoleFilter("")
    setPage(1)
  }

  function changeTierFilter(value: string) {
    setTierFilter(value)
    setPage(1)
  }

  function changeStatusFilter(value: string) {
    setStatusFilter(value)
    setPage(1)
  }

  function changeRoleFilter(value: string) {
    setRoleFilter(value)
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
              onChange={(event) => changeTierFilter(event.target.value)}
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
              onChange={(event) => changeStatusFilter(event.target.value)}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Todos os status</option>
              <option value={ACCOUNT_STATUSES.ACTIVE}>Ativo</option>
              <option value={ACCOUNT_STATUSES.DISABLED}>Desativado</option>
            </select>
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={(event) => changeRoleFilter(event.target.value)}
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
                      {user.tier ? user.tier.name : "Gratuito"}
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
  const [tierId, setTierId] = useState<string | null>(user.tierId)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSave() {
    setSaving(true)
    setSaveError(null)
    setSuccess(false)

    try {
      const updated = await assignUserTier(user.id, tierId)
      onUpdated(updated)
      setSuccess(true)
    } catch (requestError) {
      setSaveError(errorMessage(requestError))
      setTierId(user.tierId)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
        <h3 className="text-lg font-semibold text-gray-900">
          Gerenciar acesso
        </h3>

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
                : "Role somente leitura. A atribuição de roles privilegiadas é restrita ao SUPER_ADMIN."}
            </p>
          </div>

          <div>
            <span className="block text-sm font-medium text-gray-700">
              Tier de acesso
            </span>

            {loadingTiers ? (
              <p className="mt-1 text-sm text-gray-500">
                Carregando tiers...
              </p>
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
                value={tierId ?? ""}
                onChange={(event) =>
                  setTierId(event.target.value || null)
                }
                disabled={saving}
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

          <div>
            <span className="block text-sm font-medium text-gray-700">
              Status da conta
            </span>
            <p className="mt-1 text-sm text-gray-900">
              {STATUS_LABELS[user.status]}
            </p>
          </div>
        </div>

        {saveError && (
          <p className="mt-4 rounded bg-red-100 p-3 text-sm text-red-700">
            {saveError}
          </p>
        )}

        {success && (
          <p className="mt-4 rounded bg-green-100 p-3 text-sm text-green-700">
            Tier atualizado com sucesso.
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
          >
            Fechar
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || loadingTiers}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar tier"}
          </button>
        </div>
      </div>
    </div>
  )
}

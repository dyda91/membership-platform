import { useCallback, useEffect, useMemo, useState } from "react"
import type { AxiosError } from "axios"

import {
  ACCOUNT_STATUSES,
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
import PageContainer from "../../components/ui/PageContainer"
import PageHeader from "../../components/ui/PageHeader"
import Card from "../../components/ui/Card"
import Input from "../../components/ui/Input"
import Select from "../../components/ui/Select"
import Button from "../../components/ui/Button"
import Alert from "../../components/ui/Alert"
import EmptyState from "../../components/ui/EmptyState"
import Skeleton from "../../components/ui/Skeleton"
import { useMediaQuery } from "../../hooks/useMediaQuery"
import UsersDesktopTable from "../../components/admin/UsersDesktopTable"
import UsersMobileCards from "../../components/admin/UsersMobileCards"
import ActiveFilterChips from "../../components/admin/ActiveFilterChips"
import type { FilterChip } from "../../components/admin/ActiveFilterChips"
import ManageAccessDialog from "../../components/admin/ManageAccessDialog"

const PAGE_SIZE = 10

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: ACCOUNT_STATUSES.ACTIVE, label: "Ativo" },
  { value: ACCOUNT_STATUSES.DISABLED, label: "Desativado" },
]

const ACCESS_OPTIONS: { value: string; label: string }[] = [
  { value: "ACTIVE", label: "Ativo" },
  { value: "EXPIRING_SOON", label: "Expirando em breve" },
  { value: "EXPIRED", label: "Expirado" },
  { value: "PERMANENT", label: "Permanente" },
  { value: "SCHEDULED", label: "Agendado" },
  { value: "REVOKED", label: "Revogado" },
  { value: "NONE", label: "Sem acesso" },
]

const ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: "SUBSCRIBER", label: "Assinante" },
  { value: "ARTIST", label: "Artista" },
]

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

export default function UsersAdminPage() {
  const { user: sessionUser } = useAuth()
  const isSuperAdmin = sessionUser?.isSuperAdmin ?? false
  const isDesktop = useMediaQuery("(min-width: 640px)")

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
    setTierError(null)

    try {
      const data = await fetchTiers()
      setTiers(data)
    } catch {
      setTierError("Não foi possível carregar os tiers.")
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

  const activeChips: FilterChip[] = useMemo(() => {
    const chips: FilterChip[] = []

    if (search) {
      chips.push({
        key: "search",
        label: `Busca: ${search}`,
        onRemove: () => {
          setSearchInput("")
          setSearch("")
          setPage(1)
        },
      })
    }

    if (tierFilter) {
      chips.push({
        key: "tier",
        label: `Tier: ${tiers.find((tier) => tier.id === tierFilter)?.name ?? tierFilter}`,
        onRemove: () => {
          setTierFilter("")
          setPage(1)
        },
      })
    }

    if (statusFilter) {
      chips.push({
        key: "status",
        label: `Status: ${STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label ?? statusFilter}`,
        onRemove: () => {
          setStatusFilter("")
          setPage(1)
        },
      })
    }

    if (accessFilter) {
      chips.push({
        key: "access",
        label: `Acesso: ${ACCESS_OPTIONS.find((o) => o.value === accessFilter)?.label ?? accessFilter}`,
        onRemove: () => {
          setAccessFilter("")
          setPage(1)
        },
      })
    }

    if (roleFilter) {
      chips.push({
        key: "role",
        label: `Role: ${ROLE_OPTIONS.find((o) => o.value === roleFilter)?.label ?? roleFilter}`,
        onRemove: () => {
          setRoleFilter("")
          setPage(1)
        },
      })
    }

    return chips
  }, [search, tierFilter, statusFilter, accessFilter, roleFilter, tiers])

  const hasActiveFilters =
    search !== "" ||
    tierFilter !== "" ||
    statusFilter !== "" ||
    accessFilter !== "" ||
    roleFilter !== ""

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
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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
              {ACCESS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
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
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={applySearch}>Buscar</Button>
          <Button
            variant="outline"
            onClick={clearFilters}
            disabled={!hasActiveFilters && searchInput === ""}
          >
            Limpar busca e filtros
          </Button>
        </div>
      </Card>

      <div className="mt-3">
        <ActiveFilterChips chips={activeChips} onClearAll={clearFilters} />
      </div>

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
          <div className="space-y-3 p-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            className="m-4 border-0"
            title="Nenhum usuário encontrado"
            description={
              hasActiveFilters
                ? "Nenhum usuário corresponde aos filtros ativos. Ajuste a busca ou limpe os filtros."
                : "Ainda não há membros cadastrados."
            }
          />
        ) : isDesktop ? (
          <UsersDesktopTable
            users={users}
            onManage={setSelected}
          />
        ) : (
          <UsersMobileCards
            users={users}
            onManage={setSelected}
          />
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
        <ManageAccessDialog
          user={selected}
          tiers={tiers}
          isSuperAdmin={isSuperAdmin}
          onClose={() => setSelected(null)}
          onUpdated={handleUpdated}
        />
      )}
    </PageContainer>
  )
}

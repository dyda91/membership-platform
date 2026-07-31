import { useCallback, useEffect, useState } from "react"
import type { AxiosError } from "axios"

import {
  ACCOUNT_STATUSES,
  assignRole,
  fetchUsers,
  removeRole,
  setUserStatus,
} from "../../services/users"
import type {
  AccountStatus,
  Role,
  User,
} from "../../services/users"

function errorMessage(error: unknown) {
  const status = (error as AxiosError)?.response?.status

  if (status === 401) {
    return "Sua sessão expirou. Faça login novamente."
  }

  if (status === 403) {
    return "Usuário sem permissão para acessar este recurso."
  }

  return "Não foi possível carregar os usuários. Tente novamente."
}

const ALL_ROLES: Role[] = ["ADMIN", "ARTIST", "SUBSCRIBER"]

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrador",
  ARTIST: "Artista",
  SUBSCRIBER: "Assinante",
}

const STATUS_LABELS: Record<AccountStatus, string> = {
  ACTIVE: "Ativo",
  DISABLED: "Desativado",
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR")
}

export default function UsersAdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const loadUsers = useCallback(async () => {
    try {
      setError(null)
      const data = await fetchUsers()
      setUsers(data)
    } catch (error) {
      setError(errorMessage(error))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadUsers()
  }, [loadUsers])

  async function handleAssignRole(user: User, role: Role) {
    const updated = await assignRole(user.id, role)
    setUsers((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    )
  }

  async function handleRemoveRole(user: User, role: Role) {
    const updated = await removeRole(user.id, role)
    setUsers((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    )
  }

  async function handleToggleStatus(user: User) {
    const status =
      user.status === ACCOUNT_STATUSES.ACTIVE
        ? ACCOUNT_STATUSES.DISABLED
        : ACCOUNT_STATUSES.ACTIVE
    const updated = await setUserStatus(user.id, status)
    setUsers((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    )
  }

  if (loading) {
    return <p className="text-gray-600">Carregando usuários...</p>
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-black">
        Gerenciamento de Usuários
      </h2>

      <p className="mt-2 text-gray-600">
        Visualize e administre perfis, papéis e status de contas.
      </p>

      {error && (
        <p className="mt-4 rounded bg-red-100 p-3 text-red-700">
          {error}
        </p>
      )}

      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
        {users.length === 0 ? (
          <p className="p-6 text-gray-600">
            Nenhum usuário encontrado.
          </p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Papéis
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Criado em
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  expanded={expandedId === user.id}
                  onToggleExpand={() =>
                    setExpandedId((current) =>
                      current === user.id ? null : user.id,
                    )
                  }
                  onAssignRole={(role) => void handleAssignRole(user, role)}
                  onRemoveRole={(role) => void handleRemoveRole(user, role)}
                  onToggleStatus={() => void handleToggleStatus(user)}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

interface UserRowProps {
  user: User
  expanded: boolean
  onToggleExpand: () => void
  onAssignRole: (role: Role) => void
  onRemoveRole: (role: Role) => void
  onToggleStatus: () => void
}

function UserRow({
  user,
  expanded,
  onToggleExpand,
  onAssignRole,
  onRemoveRole,
  onToggleStatus,
}: UserRowProps) {
  return (
    <>
      <tr
        className="cursor-pointer hover:bg-gray-50"
        onClick={onToggleExpand}
      >
        <td className="px-6 py-4 text-sm font-medium text-gray-900">
          {user.name || "—"}
        </td>
        <td className="px-6 py-4 text-sm text-gray-600">
          {user.email}
        </td>
        <td className="px-6 py-4 text-sm text-gray-600">
          {user.roles.map((role) => ROLE_LABELS[role]).join(", ") || "—"}
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
      </tr>

      {expanded && (
        <tr>
          <td colSpan={5} className="bg-gray-50 px-6 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Papéis
                </h3>

                <ul className="mt-2 space-y-2">
                  {ALL_ROLES.map((role) => {
                    const assigned = user.roles.includes(role)

                    return (
                      <li key={role} className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">
                          {ROLE_LABELS[role]}
                        </span>

                        {assigned ? (
                          <button
                            type="button"
                            onClick={() => onRemoveRole(role)}
                            className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
                          >
                            Remover
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onAssignRole(role)}
                            className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200"
                          >
                            Atribuir
                          </button>
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Status da conta
                </h3>

                <p className="mt-2 text-sm text-gray-700">
                  {STATUS_LABELS[user.status]}
                </p>

                <button
                  type="button"
                  onClick={onToggleStatus}
                  className={`mt-2 rounded px-3 py-1 text-sm font-medium text-white ${
                    user.status === ACCOUNT_STATUSES.ACTIVE
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-green-500 hover:bg-green-600"
                  }`}
                >
                  {user.status === ACCOUNT_STATUSES.ACTIVE
                    ? "Desativar conta"
                    : "Reativar conta"}
                </button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

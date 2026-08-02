import type { User } from "../../services/users"
import type { TierAccessStatus } from "../../services/tier-access"
import Button from "../ui/Button"
import Badge from "../ui/Badge"
import {
  RoleBadge,
  AccountStatusBadge,
  AccessStatusBadge,
} from "../ui/status-badges"
import Avatar from "../ui/Avatar"

interface UsersDesktopTableProps {
  users: User[]
  onManage: (user: User) => void
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR")
}

function accessDetail(user: User) {
  const access = user.tierAccess

  if (!access || access.status === "NONE") {
    return "Sem acesso premium"
  }

  if (access.permanent) {
    return "Acesso permanente"
  }

  if (access.expiresAt) {
    return `Válido até ${formatDate(access.expiresAt)}`
  }

  return access.status
}

export default function UsersDesktopTable({
  users,
  onManage,
}: UsersDesktopTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-surface-muted">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
              Usuário
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
              Email
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
              Role
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
              Tier
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
              Acesso
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
              Status da conta
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
              Criado em
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wide text-foreground-muted">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-surface-muted">
              <td className="px-6 py-4">
                <div className="flex items-center gap-2.5">
                  <Avatar url={null} name={user.name} size="sm" ariaLabel={user.name ?? user.email} />
                  <span className="text-sm font-medium text-foreground">
                    {user.name || "—"}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-foreground-muted">
                {user.email}
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1.5">
                  {user.roles.map((role) => (
                    <RoleBadge key={role} role={role} />
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-foreground-muted">
                {user.tierAccess?.tier?.name ?? user.tier?.name ?? (
                  <Badge variant="neutral">Gratuito</Badge>
                )}
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-col items-start gap-1">
                  <AccessStatusBadge
                    status={(user.tierAccess?.status ?? "NONE") as TierAccessStatus}
                  />
                  <span className="text-xs text-foreground-muted">
                    {accessDetail(user)}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4">
                <AccountStatusBadge status={user.status} />
              </td>
              <td className="px-6 py-4 text-sm text-foreground-muted">
                {formatDate(user.createdAt)}
              </td>
              <td className="px-6 py-4 text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onManage(user)}
                >
                  Gerenciar acesso
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

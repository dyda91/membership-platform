import type { User } from "../../services/users"
import type { TierAccessStatus } from "../../services/tier-access"
import Button from "../ui/Button"
import Card from "../ui/Card"
import Avatar from "../ui/Avatar"
import {
  RoleBadge,
  AccountStatusBadge,
  AccessStatusBadge,
} from "../ui/status-badges"

interface UsersMobileCardsProps {
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

export default function UsersMobileCards({
  users,
  onManage,
}: UsersMobileCardsProps) {
  return (
    <ul className="space-y-3">
      {users.map((user) => (
        <li key={user.id}>
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <Avatar
                url={null}
                name={user.name}
                size="md"
                ariaLabel={user.name ?? user.email}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {user.name || "—"}
                </p>
                <p className="truncate text-sm text-foreground-muted">
                  {user.email}
                </p>
              </div>
            </div>

            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-foreground-muted">Role</dt>
                <dd className="flex flex-wrap justify-end gap-1.5">
                  {user.roles.map((role) => (
                    <RoleBadge key={role} role={role} />
                  ))}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-foreground-muted">Tier</dt>
                <dd className="text-foreground">
                  {user.tierAccess?.tier?.name ?? user.tier?.name ?? "Gratuito"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-foreground-muted">Acesso</dt>
                <dd className="flex flex-col items-end gap-1">
                  <AccessStatusBadge
                    status={(user.tierAccess?.status ?? "NONE") as TierAccessStatus}
                  />
                  <span className="text-xs text-foreground-muted">
                    {accessDetail(user)}
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-foreground-muted">Status da conta</dt>
                <dd>
                  <AccountStatusBadge status={user.status} />
                </dd>
              </div>
            </dl>

            <div className="mt-4">
              <Button
                variant="outline"
                fullWidth
                onClick={() => onManage(user)}
              >
                Gerenciar acesso
              </Button>
            </div>
          </Card>
        </li>
      ))}
    </ul>
  )
}

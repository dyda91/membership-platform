import Badge from "../ui/Badge"
import { accessStatusVariant } from "../ui/status-labels"
import type { UserTier } from "../../services/users"

interface TierBadgeProps {
  tier: UserTier | null
  accessStatus?: string
  expiresAt?: string | null
  permanent?: boolean
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR")
}

export default function TierBadge({
  tier,
  accessStatus,
  expiresAt,
  permanent,
}: TierBadgeProps) {
  if (!tier || accessStatus === "EXPIRED" || accessStatus === "REVOKED") {
    const expired = accessStatus === "EXPIRED"

    return (
      <Badge
        variant={expired ? "danger" : "neutral"}
        title={
          expired
            ? "Acesso expirado"
            : accessStatus === "REVOKED"
              ? "Acesso revogado"
              : undefined
        }
      >
        {expired ? "Expirado" : "Gratuito"}
      </Badge>
    )
  }

  return (
    <Badge
      variant={accessStatusVariant(accessStatus ?? "ACTIVE")}
      title={
        permanent
          ? "Acesso permanente"
          : expiresAt
            ? `Válido até ${formatDate(expiresAt)}`
            : undefined
      }
    >
      {tier.name}
    </Badge>
  )
}

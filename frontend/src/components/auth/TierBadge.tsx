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
    return (
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
          accessStatus === "EXPIRED"
            ? "bg-red-100 text-red-700"
            : "bg-gray-200 text-gray-600"
        }`}
        title={accessStatus === "EXPIRED" ? "Acesso expirado" : undefined}
      >
        {accessStatus === "EXPIRED" ? "Expirado" : "Gratuito"}
      </span>
    )
  }

  return (
    <span
      className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700"
      title={
        permanent
          ? "Acesso permanente"
          : expiresAt
            ? `Válido até ${formatDate(expiresAt)}`
            : undefined
      }
    >
      {tier.name}
    </span>
  )
}

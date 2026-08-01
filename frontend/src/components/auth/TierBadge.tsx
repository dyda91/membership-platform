import type { UserTier } from "../../services/users"

interface TierBadgeProps {
  tier: UserTier | null
}

export default function TierBadge({ tier }: TierBadgeProps) {
  if (!tier) {
    return (
      <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
        Gratuito
      </span>
    )
  }

  return (
    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
      {tier.name}
    </span>
  )
}

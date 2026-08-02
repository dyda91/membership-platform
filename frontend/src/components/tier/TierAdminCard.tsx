import type { Tier } from "../../services/tiers"
import Card from "../ui/Card"
import Badge from "../ui/Badge"
import Button from "../ui/Button"

interface TierAdminCardProps {
  tier: Tier
  onEdit: (tier: Tier) => void
  onDelete: (tier: Tier) => void
}

export default function TierAdminCard({
  tier,
  onEdit,
  onDelete,
}: TierAdminCardProps) {
  const usage = tier._count

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">{tier.name}</h3>
            <Badge variant="primary">Prioridade {tier.priority}</Badge>
          </div>
          <p className="mt-1 text-sm text-foreground-muted">{tier.description}</p>
        </div>

        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={() => onEdit(tier)}>
            Editar
          </Button>
          <Button variant="danger" size="sm" onClick={() => onDelete(tier)}>
            Excluir
          </Button>
        </div>
      </div>

      {usage && (
        <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground-muted">
          <div className="flex gap-1">
            <dt className="font-medium">Membros:</dt>
            <dd>{usage.users}</dd>
          </div>
          <div className="flex gap-1">
            <dt className="font-medium">Posts:</dt>
            <dd>{usage.posts}</dd>
          </div>
          <div className="flex gap-1">
            <dt className="font-medium">Atribuições:</dt>
            <dd>{usage.tierAccessAssignments}</dd>
          </div>
        </dl>
      )}
    </Card>
  )
}

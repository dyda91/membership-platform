import type { BadgeVariant } from "../ui/status-labels"

export const ACCESS_ACTION_LABELS: Record<string, string> = {
  GRANTED: "Acesso concedido",
  RENEWED: "Renovação",
  TIER_CHANGED: "Tier alterado",
  DATES_CHANGED: "Datas alteradas",
  REVOKED: "Acesso revogado",
  RESTORED: "Acesso restaurado",
  MIGRATED: "Dados migrados",
}

export const ACCESS_ACTION_VARIANTS: Record<string, BadgeVariant> = {
  GRANTED: "success",
  RENEWED: "primary",
  TIER_CHANGED: "info",
  DATES_CHANGED: "info",
  REVOKED: "danger",
  RESTORED: "success",
  MIGRATED: "neutral",
}

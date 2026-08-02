import type { Role, AccountStatus } from "../../services/users"
import type { PostStatus } from "../../services/posts"

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  ARTIST: "Artista",
  SUBSCRIBER: "Assinante",
}

export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  ACTIVE: "Ativo",
  DISABLED: "Desativado",
}

export const ACCESS_STATUS_LABELS: Record<string, string> = {
  NONE: "Sem acesso",
  SCHEDULED: "Agendado",
  ACTIVE: "Ativo",
  EXPIRING_SOON: "Expirando",
  EXPIRED: "Expirado",
  REVOKED: "Revogado",
  PERMANENT: "Permanente",
}

export const POST_STATUS_LABELS: Record<PostStatus, string> = {
  DRAFT: "Rascunho",
  PUBLISHED: "Publicado",
  ARCHIVED: "Arquivado",
}

export type BadgeVariant =
  | "neutral"
  | "primary"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "accent"

export function roleBadgeVariant(role: Role): BadgeVariant {
  switch (role) {
    case "SUPER_ADMIN":
      return "danger"
    case "ARTIST":
      return "accent"
    case "SUBSCRIBER":
      return "info"
  }
}

export function accountStatusVariant(status: AccountStatus): BadgeVariant {
  return status === "ACTIVE" ? "success" : "danger"
}

export function accessStatusVariant(status: string): BadgeVariant {
  switch (status) {
    case "ACTIVE":
      return "success"
    case "EXPIRING_SOON":
      return "warning"
    case "EXPIRED":
    case "REVOKED":
      return "danger"
    case "PERMANENT":
      return "accent"
    case "SCHEDULED":
      return "info"
    default:
      return "neutral"
  }
}

export function postStatusVariant(status: PostStatus): BadgeVariant {
  switch (status) {
    case "PUBLISHED":
      return "success"
    case "DRAFT":
      return "warning"
    case "ARCHIVED":
      return "neutral"
  }
}

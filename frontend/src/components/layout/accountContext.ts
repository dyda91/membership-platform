import type { SessionUser } from "../../services/auth"
import { isArtist, isSuperAdmin } from "../../services/permissions"

export interface AccountContext {
  title: string
  subtitle: string
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR")
}

export function displayName(user: SessionUser): string {
  return user.name?.trim() || user.email
}

export function initials(user: SessionUser): string {
  const name = displayName(user)
  const part = name.trim().charAt(0).toUpperCase()

  return part || "?"
}

export function getAccountContext(user: SessionUser): AccountContext {
  if (isSuperAdmin(user)) {
    return { title: "Super Admin", subtitle: "Administração do sistema" }
  }

  if (isArtist(user)) {
    return { title: "Artista", subtitle: "Gerenciamento da plataforma" }
  }

  const status = user.tierAccessStatus
  const tier = user.tier

  if (tier && status !== "EXPIRED" && status !== "REVOKED" && status !== "NONE") {
    if (user.tierPermanent) {
      return { title: tier.name, subtitle: "Acesso permanente" }
    }

    if (user.tierExpiresAt) {
      return {
        title: tier.name,
        subtitle: `Válido até ${formatDate(user.tierExpiresAt)}`,
      }
    }

    if (status === "EXPIRING_SOON") {
      return { title: tier.name, subtitle: "Expira em breve" }
    }

    return { title: tier.name, subtitle: "Acesso ativo" }
  }

  if (status === "EXPIRED" && tier) {
    return { title: "Gratuito", subtitle: `Acesso ${tier.name} expirado` }
  }

  if (status === "REVOKED") {
    return { title: "Gratuito", subtitle: "Acesso revogado" }
  }

  return { title: "Gratuito", subtitle: "Acesso gratuito" }
}

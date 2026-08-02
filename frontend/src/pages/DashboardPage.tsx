import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { fetchDashboardSummary } from "../services/dashboard"
import type { DashboardSummary } from "../services/dashboard"
import PageContainer from "../components/ui/PageContainer"
import PageHeader from "../components/ui/PageHeader"
import Skeleton from "../components/ui/Skeleton"
import ErrorState from "../components/ui/ErrorState"
import DashboardSummaryCard from "../components/admin/DashboardSummaryCard"
import { buttonClasses } from "../components/ui/button-styles"
import {
  IconPosts,
  IconUsers,
  IconTier,
  IconArtist,
} from "../components/ui/Icons"

interface QuickAction {
  to: string
  title: string
  description: string
  icon: React.ReactNode
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    to: "/posts/new",
    title: "Criar Post",
    description: "Publicar um novo conteúdo.",
    icon: <IconPosts />,
  },
  {
    to: "/users",
    title: "Gerenciar Membros",
    description: "Buscar, filtrar e gerenciar membros.",
    icon: <IconUsers />,
  },
  {
    to: "/tiers",
    title: "Gerenciar Tiers",
    description: "Configurar níveis de acesso.",
    icon: <IconTier />,
  },
  {
    to: "/artist-profile/edit",
    title: "Editar Perfil Público",
    description: "Ajustar identidade e contatos públicos.",
    icon: <IconArtist />,
  },
]

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await fetchDashboardSummary()
      setSummary(data)
    } catch {
      setError("Não foi possível carregar o resumo do painel.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <PageContainer width="wide">
      <PageHeader
        title="Dashboard"
        description="Visão geral operacional da plataforma."
      />

      <section aria-label="Ações rápidas" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="group rounded-lg border border-border bg-surface p-5 shadow-card transition-shadow hover:shadow-overlay"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-muted text-primary-foreground-muted">
                {action.icon}
              </span>
              <h3 className="text-base font-semibold text-foreground">
                {action.title}
              </h3>
            </div>
            <p className="mt-1 text-sm text-foreground-muted">
              {action.description}
            </p>
          </Link>
        ))}
      </section>

      <section aria-label="Resumo operacional" className="mt-8">
        <h2 className="text-lg font-semibold text-foreground">Resumo</h2>

        {loading && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-28 w-full" />
            ))}
          </div>
        )}

        {error && (
          <div className="mt-4">
            <ErrorState
              title={error}
              onRetry={() => void load()}
              retryLabel="Tentar novamente"
            />
          </div>
        )}

        {!loading && !error && summary && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DashboardSummaryCard
              label="Membros visíveis"
              value={summary.visibleUsers}
              description="Contas excluindo o SUPER_ADMIN oculto."
            />
            <DashboardSummaryCard
              label="Posts publicados"
              value={summary.publishedPosts}
              tone="success"
              action={
                <Link to="/posts" className={buttonClasses("ghost", "sm")}>
                  Ver posts
                </Link>
              }
            />
            <DashboardSummaryCard
              label="Rascunhos"
              value={summary.draftPosts}
              tone="warning"
            />
            <DashboardSummaryCard
              label="Arquivados"
              value={summary.archivedPosts}
              tone="neutral"
            />
            <DashboardSummaryCard
              label="Tiers"
              value={summary.tiers}
              description="Níveis de acesso configurados."
              action={
                <Link to="/tiers" className={buttonClasses("ghost", "sm")}>
                  Gerenciar
                </Link>
              }
            />
            <DashboardSummaryCard
              label="Acessos ativos"
              value={summary.activeAccess}
              tone="success"
            />
            <DashboardSummaryCard
              label="Expirando em breve"
              value={summary.expiringSoonAccess}
              tone="warning"
            />
            <DashboardSummaryCard
              label="Acessos permanentes"
              value={summary.permanentAccess}
              tone="primary"
            />
          </div>
        )}

        {!loading && !error && summary && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <DashboardSummaryCard
              label="Acessos expirados"
              value={summary.expiredAccess}
              tone="danger"
            />
            <DashboardSummaryCard
              label="Acessos agendados"
              value={summary.scheduledAccess}
              tone="neutral"
            />
            <DashboardSummaryCard
              label="Acessos revogados"
              value={summary.revokedAccess}
              tone="danger"
            />
          </div>
        )}
      </section>
    </PageContainer>
  )
}

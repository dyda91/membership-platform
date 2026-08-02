import { Link } from "react-router-dom"

import ApiStatus from "../components/ApiStatus"
import PageContainer from "../components/ui/PageContainer"
import PageHeader from "../components/ui/PageHeader"
import Card from "../components/ui/Card"
import { IconPosts, IconUsers, IconTier, IconProfile } from "../components/ui/Icons"

const LINKS = [
  {
    to: "/posts",
    title: "Posts",
    description: "Criar e gerenciar conteúdos.",
    icon: <IconPosts />,
  },
  {
    to: "/users",
    title: "Usuários",
    description: "Gerenciar contas e membros.",
    icon: <IconUsers />,
  },
  {
    to: "/tiers",
    title: "Tiers",
    description: "Gerenciar níveis de acesso.",
    icon: <IconTier />,
  },
  {
    to: "/profile",
    title: "Perfil",
    description: "Editar o perfil do artista.",
    icon: <IconProfile />,
  },
]

export default function DashboardPage() {
  return (
    <PageContainer width="wide">
      <PageHeader
        title="Dashboard"
        description="Área administrativa da plataforma."
      />

      <Card className="mb-6 p-4">
        <ApiStatus />
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="group rounded-lg border border-border bg-surface p-6 shadow-card transition-shadow hover:shadow-overlay"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary-muted text-primary-foreground-muted">
                {link.icon}
              </span>
              <h3 className="text-lg font-semibold text-foreground">
                {link.title}
              </h3>
            </div>
            <p className="mt-1 text-sm text-foreground-muted">
              {link.description}
            </p>
          </Link>
        ))}
      </div>
    </PageContainer>
  )
}

import { Link } from "react-router-dom"

import { useDashboardSummary } from "../../../hooks/useDashboardSummary"
import RightPanelCard from "./RightPanelCard"
import { buttonClasses } from "../../ui/button-styles"

export default function PostsSidePanel() {
  const { summary } = useDashboardSummary()

  return (
    <div className="space-y-4">
      <RightPanelCard title="Conteúdo">
        {summary ? (
          <ul className="space-y-1">
            <li className="flex justify-between gap-2">
              <span>Publicados</span>
              <span className="font-semibold text-foreground">{summary.publishedPosts}</span>
            </li>
            <li className="flex justify-between gap-2">
              <span>Rascunhos</span>
              <span className="font-semibold text-foreground">{summary.draftPosts}</span>
            </li>
            <li className="flex justify-between gap-2">
              <span>Arquivados</span>
              <span className="font-semibold text-foreground">{summary.archivedPosts}</span>
            </li>
          </ul>
        ) : (
          <p>Carregando totais…</p>
        )}
      </RightPanelCard>

      <RightPanelCard title="Visibilidade">
        <p>
          Rascunhos ficam privados. Publicados aparecem no Feed e podem ser
          liberados por tier. Arquivados ficam ocultos do público.
        </p>
      </RightPanelCard>

      <Link to="/posts/new">
        <span className={buttonClasses("primary", "sm", "w-full justify-center")}>
          Criar post
        </span>
      </Link>
    </div>
  )
}

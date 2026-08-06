import { Link } from "react-router-dom"

import { useDashboardSummary } from "../../../hooks/useDashboardSummary"
import RightPanelCard from "./RightPanelCard"
import { buttonClasses } from "../../ui/button-styles"

export default function TiersSidePanel() {
  const { summary } = useDashboardSummary()

  return (
    <div className="space-y-4">
      <RightPanelCard title="Prioridade">
        {summary ? (
          <p>
            <span className="font-semibold text-foreground">{summary.tiers}</span>{" "}
            {summary.tiers === 1 ? "tier configurado" : "tiers configurados"}.
          </p>
        ) : (
          <p>Carregando totais…</p>
        )}
        <p>
          A prioridade é cumulativa: um tier superior desbloqueia o conteúdo de
          todos os tiers anteriores.
        </p>
      </RightPanelCard>

      <RightPanelCard title="Atenção">
        <p>
          Antes de excluir um tier, confirme que nenhum membro ou post depende
          dele. A exclusão pode afetar acessos vigentes.
        </p>
      </RightPanelCard>

      <Link to="/tiers?new=1">
        <span className={buttonClasses("primary", "sm", "w-full justify-center")}>
          Criar tier
        </span>
      </Link>
    </div>
  )
}

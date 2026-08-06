import { useDashboardSummary } from "../../../hooks/useDashboardSummary"
import RightPanelCard from "./RightPanelCard"

export default function UsersSidePanel() {
  const { summary } = useDashboardSummary()

  return (
    <div className="space-y-4">
      <RightPanelCard title="Membros">
        {summary ? (
          <ul className="space-y-1">
            <li className="flex justify-between gap-2">
              <span>Visíveis</span>
              <span className="font-semibold text-foreground">{summary.visibleUsers}</span>
            </li>
            <li className="flex justify-between gap-2">
              <span>Acessos ativos</span>
              <span className="font-semibold text-foreground">{summary.activeAccess}</span>
            </li>
            <li className="flex justify-between gap-2">
              <span>Expirando</span>
              <span className="font-semibold text-foreground">{summary.expiringSoonAccess}</span>
            </li>
            <li className="flex justify-between gap-2">
              <span>Expirados</span>
              <span className="font-semibold text-foreground">{summary.expiredAccess}</span>
            </li>
          </ul>
        ) : (
          <p>Carregando totais…</p>
        )}
      </RightPanelCard>

      <RightPanelCard title="Role, tier e acesso">
        <p>
          <strong className="text-foreground">Role</strong> define permissões de
          plataforma (membro, artista, administração). <strong className="text-foreground">Tier</strong> é o
          nível de conteúdo. <strong className="text-foreground">Acesso</strong> é a atribuição efetiva do tier,
          com validade própria.
        </p>
      </RightPanelCard>
    </div>
  )
}

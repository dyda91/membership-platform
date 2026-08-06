import { useLocation } from "react-router-dom"

import { useRightPanel } from "./RightPanelContext"
import { getRightPanelForRoute } from "./getRightPanelForRoute"

/**
 * Contextual right panel shown on wide screens (>= 1440px). The content comes
 * from the currently mounted page (via the right-panel context) or from a
 * static route registry. It is hidden entirely when there is no content so the
 * main column keeps all available width.
 */
export default function ContextualRightPanel() {
  const { content } = useRightPanel()
  const { pathname } = useLocation()
  const node = content ?? getRightPanelForRoute(pathname)

  if (!node) {
    return null
  }

  return (
    <aside
      aria-label="Painel contextual"
      className="sticky top-0 hidden h-[100dvh] w-[320px] shrink-0 flex-col self-start overflow-y-auto border-l border-border bg-surface min-[1440px]:flex"
    >
      <div className="space-y-4 p-4 pb-8">{node}</div>
    </aside>
  )
}

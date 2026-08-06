import { Outlet } from "react-router-dom"

import { useAuth } from "../../contexts/AuthContext"
import DesktopSidebar from "./DesktopSidebar"
import MobileNavigation from "./MobileNavigation"
import PublicHeader from "./PublicHeader"
import ContextualRightPanel from "./right-panel/ContextualRightPanel"
import { RightPanelProvider } from "./right-panel/RightPanelContext"

/**
 * Root layout. Once the session is resolved it renders either the light
 * public shell (visitors) or the authenticated shell (sidebar + mobile
 * navigation) around the routed page content.
 */
export default function MainLayout() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <p className="text-sm text-foreground-muted">Carregando…</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <PublicShell />
  }

  return (
    <RightPanelProvider>
      <AuthenticatedShell />
    </RightPanelProvider>
  )
}

function PublicShell() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <PublicHeader />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}

function AuthenticatedShell() {
  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-background">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto flex min-h-full w-full max-w-[1480px]">
          <DesktopSidebar />
          <main id="main-content" className="min-w-0 flex-1">
            <Outlet />
          </main>
          <ContextualRightPanel />
        </div>
      </div>
      <MobileNavigation />
    </div>
  )
}

import { useState } from "react"
import { Outlet } from "react-router-dom"

import Header from "./Header"
import MobileNavigation from "./MobileNavigation"

export default function MainLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header onOpenMobileNav={() => setMobileNavOpen(true)} />
      <MobileNavigation
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}

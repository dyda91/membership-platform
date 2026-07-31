import { Outlet } from "react-router-dom"

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow p-4">
        <h1 className="text-xl font-bold">
          Platform
        </h1>
      </header>

      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}
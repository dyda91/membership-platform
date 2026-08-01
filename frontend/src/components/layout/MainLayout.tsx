import { Link, Outlet } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"

export default function MainLayout() {
  const { isAuthenticated, isAdmin, canManageContent, user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">
            Platform
          </h1>

          <div className="flex items-center gap-4">
            <nav className="flex gap-4">
              <Link
                to="/"
                className="text-sm font-medium text-gray-700 hover:text-black"
              >
                Dashboard
              </Link>

              {canManageContent && (
                <Link
                  to="/posts"
                  className="text-sm font-medium text-gray-700 hover:text-black"
                >
                  Posts
                </Link>
              )}

              {canManageContent && (
                <Link
                  to="/profile"
                  className="text-sm font-medium text-gray-700 hover:text-black"
                >
                  Perfil
                </Link>
              )}

              {isAdmin && (
                <Link
                  to="/users"
                  className="text-sm font-medium text-gray-700 hover:text-black"
                >
                  Usuários
                </Link>
              )}

              {isAdmin && (
                <Link
                  to="/tiers"
                  className="text-sm font-medium text-gray-700 hover:text-black"
                >
                  Tiers
                </Link>
              )}
            </nav>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {user?.email}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-300"
                >
                  Sair
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Entrar
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}

import { Link, Outlet } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import TierBadge from "../auth/TierBadge"

export default function MainLayout() {
  const {
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    canManageContent,
    user,
    logout,
  } = useAuth()

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">
            Platform
          </h1>

          <div className="flex items-center gap-4">
            <nav className="flex flex-wrap gap-4">
              <Link
                to="/"
                className="text-sm font-medium text-gray-700 hover:text-black"
              >
                Feed
              </Link>

              {canManageContent && (
                <Link
                  to="/dashboard"
                  className="text-sm font-medium text-gray-700 hover:text-black"
                >
                  Dashboard
                </Link>
              )}

              {canManageContent && (
                <Link
                  to="/posts"
                  className="text-sm font-medium text-gray-700 hover:text-black"
                >
                  Posts
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

              {canManageContent && (
                <Link
                  to="/artist-profile/edit"
                  className="text-sm font-medium text-gray-700 hover:text-black"
                >
                  Página da artista
                </Link>
              )}

              {isSuperAdmin && (
                <Link
                  to="/system/artist"
                  className="text-sm font-medium text-gray-700 hover:text-black"
                >
                  Configurar artista
                </Link>
              )}

              {isAuthenticated && (
                <Link
                  to="/profile"
                  className="text-sm font-medium text-gray-700 hover:text-black"
                >
                  Perfil
                </Link>
              )}
            </nav>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {user?.email}
                </span>
                <TierBadge tier={user?.tier ?? null} />
                <button
                  type="button"
                  onClick={logout}
                  className="rounded bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-300"
                >
                  Sair
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/register"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Criar conta
                </Link>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-600 hover:text-black"
                >
                  Entrar
                </Link>
              </div>
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

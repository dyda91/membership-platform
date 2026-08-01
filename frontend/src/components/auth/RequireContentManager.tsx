import { Navigate, Outlet } from "react-router-dom"

import { useAuth } from "../../contexts/AuthContext"
import { canManagePosts } from "../../services/permissions"

export default function RequireContentManager() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <p className="p-6 text-gray-600">Carregando...</p>
  }

  if (!canManagePosts(user)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

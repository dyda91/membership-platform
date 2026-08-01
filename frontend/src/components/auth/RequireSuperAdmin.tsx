import { Navigate, Outlet } from "react-router-dom"

import { useAuth } from "../../contexts/AuthContext"
import { isSuperAdmin } from "../../services/permissions"

export default function RequireSuperAdmin() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <p className="p-6 text-gray-600">Carregando...</p>
  }

  if (!isSuperAdmin(user)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

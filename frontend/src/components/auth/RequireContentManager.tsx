import { Navigate, Outlet } from "react-router-dom"

import { useAuth } from "../../contexts/AuthContext"

export default function RequireContentManager() {
  const { canManageContent, isLoading } = useAuth()

  if (isLoading) {
    return <p className="p-6 text-gray-600">Carregando...</p>
  }

  if (!canManageContent) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

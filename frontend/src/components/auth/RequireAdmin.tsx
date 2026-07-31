import { Navigate, Outlet } from "react-router-dom"

import { useAuth } from "../../contexts/AuthContext"

export default function RequireAdmin() {
  const { isAdmin, isLoading } = useAuth()

  if (isLoading) {
    return <p className="p-6 text-gray-600">Carregando...</p>
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

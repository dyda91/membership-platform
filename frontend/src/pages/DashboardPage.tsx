import { Link } from "react-router-dom"

import ApiStatus from "../components/ApiStatus"

export default function DashboardPage() {
  return (
    <div>
      <h2 className="text-5xl font-bold text-black">
        Dashboard
      </h2>

      <p className="mt-4 text-xl text-gray-700">
        Área administrativa da plataforma.
      </p>

      <div className="mt-6">
        <ApiStatus />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          to="/posts"
          className="rounded-lg border border-gray-200 bg-white p-6 shadow hover:bg-gray-50"
        >
          <h3 className="text-lg font-semibold text-gray-900">Posts</h3>
          <p className="mt-1 text-sm text-gray-600">
            Criar e gerenciar conteúdos.
          </p>
        </Link>

        <Link
          to="/users"
          className="rounded-lg border border-gray-200 bg-white p-6 shadow hover:bg-gray-50"
        >
          <h3 className="text-lg font-semibold text-gray-900">Usuários</h3>
          <p className="mt-1 text-sm text-gray-600">
            Gerenciar contas e membros.
          </p>
        </Link>

        <Link
          to="/tiers"
          className="rounded-lg border border-gray-200 bg-white p-6 shadow hover:bg-gray-50"
        >
          <h3 className="text-lg font-semibold text-gray-900">Tiers</h3>
          <p className="mt-1 text-sm text-gray-600">
            Gerenciar níveis de acesso.
          </p>
        </Link>

        <Link
          to="/profile"
          className="rounded-lg border border-gray-200 bg-white p-6 shadow hover:bg-gray-50"
        >
          <h3 className="text-lg font-semibold text-gray-900">Perfil</h3>
          <p className="mt-1 text-sm text-gray-600">
            Editar o perfil do artista.
          </p>
        </Link>
      </div>
    </div>
  )
}

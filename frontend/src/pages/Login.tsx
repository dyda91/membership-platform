import { useState } from "react"
import type { FormEvent } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"

import { useAuth } from "../contexts/AuthContext"

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const from = (location.state as { from?: string } | null)?.from ?? "/"

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch {
      setError("Credenciais inválidas. Verifique o email e a senha.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg bg-white p-8 shadow"
      >
        <h2 className="text-2xl font-bold text-black">
          Entrar
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          Acesse a plataforma com sua conta.
        </p>

        <div className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded bg-red-100 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "Entrando..." : "Entrar"}
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Ainda não possui conta?{" "}
          <Link
            to="/register"
            className="font-medium text-blue-600 hover:underline"
          >
            Cadastre-se
          </Link>
        </p>
      </form>
    </div>
  )
}

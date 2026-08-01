import { useCallback, useEffect, useState } from "react"
import type { FormEvent } from "react"
import type { AxiosError } from "axios"

import {
  createTier,
  deleteTier,
  fetchTiers,
  updateTier,
} from "../../services/tiers"
import type {
  CreateTierData,
  Tier,
  UpdateTierData,
} from "../../services/tiers"

const EMPTY_FORM: CreateTierData = {
  name: "",
  description: "",
  priority: 0,
}

function errorMessage(error: unknown) {
  const status = (error as AxiosError)?.response?.status

  if (status === 401) {
    return "Sua sessão expirou. Faça login novamente."
  }

  if (status === 403) {
    return "Usuário sem permissão para acessar este recurso."
  }

  if (status === 409) {
    return "Já existe um tier com este nome."
  }

  return "Não foi possível processar a solicitação. Tente novamente."
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR")
}

export default function TiersAdminPage() {
  const [tiers, setTiers] = useState<Tier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<CreateTierData>(EMPTY_FORM)
  const [editing, setEditing] = useState<Tier | null>(null)
  const [deleting, setDeleting] = useState<Tier | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const loadTiers = useCallback(async () => {
    try {
      setError(null)
      const data = await fetchTiers()
      setTiers(data)
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadTiers()
  }, [loadTiers])

  function resetForm() {
    setForm(EMPTY_FORM)
    setEditing(null)
  }

  function startEdit(tier: Tier) {
    setEditing(tier)
    setForm({
      name: tier.name,
      description: tier.description,
      priority: tier.priority,
    })
    setError(null)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      if (editing) {
        const updated = await updateTier(editing.id, form as UpdateTierData)
        setTiers((current) =>
          current.map((tier) => (tier.id === updated.id ? updated : tier)),
        )
      } else {
        const created = await createTier(form)
        setTiers((current) => [...current, created])
      }

      resetForm()
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!deleting) {
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      await deleteTier(deleting.id)
      setTiers((current) => current.filter((tier) => tier.id !== deleting.id))
      setDeleting(null)
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <p className="text-gray-600">Carregando tiers...</p>
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-black">
        Gerenciamento de Tiers
      </h2>

      <p className="mt-2 text-gray-600">
        Crie e gerencie os níveis de acesso da plataforma.
      </p>

      {error && (
        <p className="mt-4 rounded bg-red-100 p-3 text-red-700">
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow"
      >
        <h3 className="text-lg font-semibold text-gray-900">
          {editing ? "Editar tier" : "Novo tier"}
        </h3>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Nome
            </label>
            <input
              id="name"
              type="text"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              required
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="priority"
              className="block text-sm font-medium text-gray-700"
            >
              Prioridade
            </label>
            <input
              id="priority"
              type="number"
              min={0}
              value={form.priority}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  priority: Number(event.target.value),
                }))
              }
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-3">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Descrição
            </label>
            <input
              id="description"
              type="text"
              value={form.description}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              required
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting
              ? "Salvando..."
              : editing
                ? "Salvar alterações"
                : "Criar tier"}
          </button>

          {editing && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
        {tiers.length === 0 ? (
          <p className="p-6 text-gray-600">
            Nenhum tier encontrado.
          </p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Descrição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Prioridade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Criado em
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tiers.map((tier) => (
                <tr key={tier.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {tier.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {tier.description}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {tier.priority}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(tier.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    <button
                      type="button"
                      onClick={() => startEdit(tier)}
                      className="rounded bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(tier)}
                      className="ml-2 rounded bg-red-100 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-200"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {deleting && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900">
              Excluir tier
            </h3>

            <p className="mt-2 text-sm text-gray-600">
              Tem certeza que deseja excluir o tier{" "}
              <span className="font-medium text-gray-900">
                {deleting.name}
              </span>
              ?
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleting(null)}
                className="rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={submitting}
                className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {submitting ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

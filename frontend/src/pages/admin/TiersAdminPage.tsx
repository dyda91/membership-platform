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
import PageContainer from "../../components/ui/PageContainer"
import PageHeader from "../../components/ui/PageHeader"
import Card from "../../components/ui/Card"
import Field from "../../components/ui/Field"
import Input from "../../components/ui/Input"
import Button from "../../components/ui/Button"
import Alert from "../../components/ui/Alert"
import EmptyState from "../../components/ui/EmptyState"
import ConfirmDialog from "../../components/ui/ConfirmDialog"

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
    return (
      <PageContainer width="wide">
        <p className="text-sm text-foreground-muted">Carregando tiers...</p>
      </PageContainer>
    )
  }

  return (
    <PageContainer width="wide">
      <PageHeader
        title="Gerenciamento de Tiers"
        description="Crie e gerencie os níveis de acesso da plataforma."
      />

      {error && (
        <div className="mb-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <h2 className="text-lg font-semibold text-foreground">
            {editing ? "Editar tier" : "Novo tier"}
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="name" label="Nome">
              <Input
                id="name"
                type="text"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
                required
              />
            </Field>

            <Field id="priority" label="Prioridade">
              <Input
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
              />
            </Field>

            <Field id="description" label="Descrição" className="sm:col-span-3">
              <Input
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
              />
            </Field>
          </div>

          <div className="flex gap-2">
            <Button type="submit" loading={submitting}>
              {submitting
                ? "Salvando..."
                : editing
                  ? "Salvar alterações"
                  : "Criar tier"}
            </Button>

            {editing && (
              <Button variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            )}
          </div>
        </form>
      </Card>

      <div className="mt-6 overflow-hidden rounded-lg border border-border bg-surface shadow-card">
        {tiers.length === 0 ? (
          <EmptyState
            className="m-4 border-0"
            title="Nenhum tier encontrado"
            description="Crie o primeiro nível de acesso acima."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-surface-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
                    Prioridade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-foreground-muted">
                    Criado em
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wide text-foreground-muted">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tiers.map((tier) => (
                  <tr key={tier.id} className="hover:bg-surface-muted">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {tier.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground-muted">
                      {tier.description}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground-muted">
                      {tier.priority}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground-muted">
                      {formatDate(tier.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(tier)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setDeleting(tier)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleting !== null}
        title="Excluir tier"
        description={
          deleting ? (
            <>
              Tem certeza que deseja excluir o tier{" "}
              <span className="font-medium text-foreground">{deleting.name}</span>
              ?
            </>
          ) : undefined
        }
        confirmLabel="Excluir"
        variant="danger"
        busy={submitting}
        onConfirm={() => void handleDelete()}
        onCancel={() => setDeleting(null)}
      />
    </PageContainer>
  )
}

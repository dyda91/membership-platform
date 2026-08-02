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
import Skeleton from "../../components/ui/Skeleton"
import TierAdminCard from "../../components/tier/TierAdminCard"

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

export default function TiersAdminPage() {
  const [tiers, setTiers] = useState<Tier[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<CreateTierData>(EMPTY_FORM)
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string
    description?: string
    priority?: string
  }>({})
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
    setFieldErrors({})
  }

  function startEdit(tier: Tier) {
    setEditing(tier)
    setForm({
      name: tier.name,
      description: tier.description,
      priority: tier.priority,
    })
    setFieldErrors({})
    setError(null)
  }

  function validateForm(): { name?: string; description?: string; priority?: string } {
    const errors: { name?: string; description?: string; priority?: string } = {}

    if (!form.name.trim()) {
      errors.name = "Informe um nome para o tier."
    }

    if (!form.description.trim()) {
      errors.description = "Informe uma descrição."
    }

    if ((form.priority ?? 0) < 0) {
      errors.priority = "A prioridade não pode ser negativa."
    }

    return errors
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    const errors = validateForm()

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)

      return
    }

    setFieldErrors({})
    setSubmitting(true)

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
      const status = (requestError as AxiosError)?.response?.status

      if (status === 400) {
        setError(
          "Este tier não pode ser excluído porque está em uso por membros, posts ou histórico de acesso.",
        )
      } else {
        setError(errorMessage(requestError))
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <PageContainer width="wide">
        <Skeleton className="h-10 w-1/3" />
        <div className="mt-6 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer width="wide">
      <PageHeader
        title="Gerenciamento de Tiers"
        description="Crie e gerencie os níveis de acesso da plataforma."
      />

      <Alert variant="info" title="Como funciona a prioridade">
        Um membro acessa o conteúdo do próprio tier e de todos os tiers de
        prioridade inferior. A prioridade é cumulativa e não representa preço.
      </Alert>

      {error && (
        <div className="mt-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <Card className="mt-6">
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          <h2 className="text-lg font-semibold text-foreground">
            {editing ? "Editar tier" : "Novo tier"}
          </h2>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field id="name" label="Nome" error={fieldErrors.name}>
              <Input
                id="name"
                type="text"
                value={form.name}
                invalid={Boolean(fieldErrors.name)}
                onChange={(event) => {
                  setForm((current) => ({ ...current, name: event.target.value }))
                  setFieldErrors((current) => ({ ...current, name: undefined }))
                }}
              />
            </Field>

            <Field
              id="priority"
              label="Prioridade"
              help="Quanto maior, mais conteúdo o tier inclui."
              error={fieldErrors.priority}
            >
              <Input
                id="priority"
                type="number"
                min={0}
                value={form.priority}
                invalid={Boolean(fieldErrors.priority)}
                onChange={(event) => {
                  setForm((current) => ({
                    ...current,
                    priority: Number(event.target.value),
                  }))
                  setFieldErrors((current) => ({ ...current, priority: undefined }))
                }}
              />
            </Field>

            <Field id="description" label="Descrição" className="sm:col-span-3" error={fieldErrors.description}>
              <Input
                id="description"
                type="text"
                value={form.description}
                invalid={Boolean(fieldErrors.description)}
                onChange={(event) => {
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                  setFieldErrors((current) => ({ ...current, description: undefined }))
                }}
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

      <div className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Tiers</h2>

        {tiers.length === 0 ? (
          <EmptyState
            title="Nenhum tier configurado"
            description="Crie o primeiro nível de acesso acima."
          />
        ) : (
          tiers.map((tier) => (
            <TierAdminCard
              key={tier.id}
              tier={tier}
              onEdit={startEdit}
              onDelete={setDeleting}
            />
          ))
        )}
      </div>

      <ConfirmDialog
        open={deleting !== null}
        title="Excluir tier"
        description={
          deleting ? (
            <>
              Tem certeza que deseja excluir o tier{" "}
              <span className="font-medium text-foreground">{deleting.name}</span>?
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

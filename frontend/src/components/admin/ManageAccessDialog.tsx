import { useCallback, useMemo, useState } from "react"
import type { FormEvent } from "react"
import type { AxiosError } from "axios"

import type { User } from "../../services/users"
import { fetchUser } from "../../services/users"
import type { Tier } from "../../services/tiers"
import {
  fetchTierAccess,
  fetchTierAccessHistory,
  grantTierAccess,
  renewTierAccess,
  revokeTierAccess,
} from "../../services/tier-access"
import type {
  TierAccessHistoryEvent,
  TierAccessStatus,
} from "../../services/tier-access"
import Dialog from "../ui/Dialog"
import Field from "../ui/Field"
import Input from "../ui/Input"
import Select from "../ui/Select"
import Checkbox from "../ui/Checkbox"
import Button from "../ui/Button"
import Alert from "../ui/Alert"
import ConfirmDialog from "../ui/ConfirmDialog"
import {
  AccessStatusBadge,
  AccountStatusBadge,
  RoleBadge,
} from "../ui/status-badges"
import { ROLE_LABELS } from "../ui/status-labels"
import AccessHistoryTimeline from "./AccessHistoryTimeline"

interface ManageAccessDialogProps {
  user: User
  tiers: Tier[]
  isSuperAdmin: boolean
  onClose: () => void
  onUpdated: (user: User) => void
}

function errorMessage(error: unknown) {
  const status = (error as AxiosError)?.response?.status

  if (status === 401) {
    return "Sua sessão expirou. Faça login novamente."
  }

  if (status === 403) {
    return "Usuário sem permissão para acessar este recurso."
  }

  return "Não foi possível processar a solicitação. Tente novamente."
}

function localDateInput(value: string | null | undefined): string {
  if (!value) {
    return ""
  }

  const d = new Date(value)

  if (Number.isNaN(d.getTime())) {
    return ""
  }

  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")

  return `${y}-${m}-${day}`
}

function toUtcEndOfDay(value: string): string {
  return `${value}T23:59:59.000Z`
}

function addDaysDate(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)

  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${y}-${m}-${day}`
}

function expectedStatus(
  startsAt: string,
  expiresAt: string,
  permanent: boolean,
): string {
  if (!startsAt) {
    return "—"
  }

  const start = new Date(`${startsAt}T00:00:00`)
  const end = permanent ? null : new Date(`${expiresAt}T23:59:59`)
  const now = new Date()

  if (permanent || end === null) {
    return "PERMANENT"
  }

  if (start > now) {
    return "SCHEDULED"
  }

  if (end <= now) {
    return "EXPIRED"
  }

  const soon = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  return end <= soon ? "EXPIRING_SOON" : "ACTIVE"
}

const EXPECTED_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Ativo",
  EXPIRING_SOON: "Expirando em breve",
  SCHEDULED: "Agendado",
  PERMANENT: "Permanente",
  EXPIRED: "Expirado",
}

export default function ManageAccessDialog({
  user,
  tiers,
  isSuperAdmin,
  onClose,
  onUpdated,
}: ManageAccessDialogProps) {
  const [access, setAccess] = useState(user.tierAccess ?? null)
  const [tierId, setTierId] = useState<string>(
    user.tierAccess?.tier?.id ?? user.tierId ?? "",
  )
  const [startsAt, setStartsAt] = useState<string>(
    localDateInput(user.tierAccess?.startsAt) || new Date().toISOString().slice(0, 10),
  )
  const [expiresAt, setExpiresAt] = useState<string>(
    localDateInput(user.tierAccess?.expiresAt),
  )
  const [permanent, setPermanent] = useState<boolean>(
    user.tierAccess?.permanent ?? false,
  )
  const [internalNote, setInternalNote] = useState("")
  const [fieldErrors, setFieldErrors] = useState<{
    startsAt?: string
    expiresAt?: string
  }>({})

  const [renewing, setRenewing] = useState(false)
  const [renewExpiresAt, setRenewExpiresAt] = useState("")
  const [renewNote, setRenewNote] = useState("")
  const [renewFieldError, setRenewFieldError] = useState<string | null>(null)

  const [confirmRevoke, setConfirmRevoke] = useState(false)
  const [revokeNote, setRevokeNote] = useState("")

  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<TierAccessHistoryEvent[] | null>(null)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [historyError, setHistoryError] = useState<string | null>(null)

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const selectedTier = useMemo(
    () => tiers.find((tier) => tier.id === tierId) ?? null,
    [tiers, tierId],
  )

  const accessStatus: TierAccessStatus = access?.status ?? "NONE"

  const reloadAccess = useCallback(async () => {
    const summary = await fetchTierAccess(user.id)
    setAccess(summary)
    setTierId(summary.tier?.id ?? "")
    setStartsAt(localDateInput(summary.startsAt) || new Date().toISOString().slice(0, 10))
    setExpiresAt(localDateInput(summary.expiresAt))
    setPermanent(summary.permanent)
  }, [user.id])

  function validateDates(): Record<string, string> {
    const errors: { startsAt?: string; expiresAt?: string } = {}

    if (!startsAt) {
      errors.startsAt = "Informe a data de início."
    }

    if (!permanent && !expiresAt) {
      errors.expiresAt = "Informe a expiração ou marque acesso permanente."
    } else if (!permanent && expiresAt && expiresAt <= startsAt) {
      errors.expiresAt = "A expiração deve ser posterior ao início."
    }

    return errors
  }

  async function handleGrant(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    const errors = validateDates()

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)

      return
    }

    setFieldErrors({})
    setBusy(true)

    try {
      await grantTierAccess(user.id, {
        tierId,
        startsAt: `${startsAt}T00:00:00.000Z`,
        expiresAt: permanent ? null : toUtcEndOfDay(expiresAt),
        permanent,
        internalNote: internalNote || undefined,
      })
      await reloadAccess()
      setSuccess("Acesso concedido com sucesso.")
      onUpdated(await refetchUserWithAccess(user.id))
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setBusy(false)
    }
  }

  async function handleRenew() {
    setError(null)
    setSuccess(null)

    if (!renewExpiresAt) {
      setRenewFieldError("Informe a nova data de expiração.")

      return
    }

    setRenewFieldError(null)
    setBusy(true)

    try {
      await renewTierAccess(user.id, {
        expiresAt: toUtcEndOfDay(renewExpiresAt),
        permanent: false,
        internalNote: renewNote || undefined,
      })
      await reloadAccess()
      setRenewing(false)
      setRenewExpiresAt("")
      setRenewNote("")
      setSuccess("Acesso renovado com sucesso.")
      onUpdated(await refetchUserWithAccess(user.id))
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setBusy(false)
    }
  }

  async function handleRevoke() {
    setError(null)
    setSuccess(null)
    setBusy(true)

    try {
      await revokeTierAccess(user.id, revokeNote || undefined)
      await reloadAccess()
      setConfirmRevoke(false)
      setRevokeNote("")
      setSuccess("Acesso revogado.")
      onUpdated(await refetchUserWithAccess(user.id))
    } catch (requestError) {
      setError(errorMessage(requestError))
    } finally {
      setBusy(false)
    }
  }

  async function handleToggleHistory() {
    if (showHistory) {
      setShowHistory(false)

      return
    }

    setShowHistory(true)
    setLoadingHistory(true)
    setHistoryError(null)

    try {
      const data = await fetchTierAccessHistory(user.id)
      setHistory(data)
    } catch (requestError) {
      setHistoryError(errorMessage(requestError))
    } finally {
      setLoadingHistory(false)
    }
  }

  const hasAccess = accessStatus !== "NONE" && accessStatus !== "REVOKED"

  return (
    <>
      <Dialog
        open
        onClose={onClose}
        title="Gerenciar acesso"
        description={`${user.name || "Membro"} · ${user.email}`}
        size="lg"
      >
        <div className="space-y-6">
          <section aria-labelledby="identity-heading">
            <h3 id="identity-heading" className="text-sm font-semibold text-foreground">
              Identidade
            </h3>
            <div className="mt-2 rounded-md border border-border bg-surface-muted/50 p-3">
              <p className="text-sm font-medium text-foreground">
                {user.name || "—"}
              </p>
              <p className="text-sm text-foreground-muted">{user.email}</p>
            </div>
          </section>

          <section aria-labelledby="account-heading">
            <h3 id="account-heading" className="text-sm font-semibold text-foreground">
              Conta
            </h3>
            <div className="mt-2 flex items-center gap-2">
              <AccountStatusBadge status={user.status} />
              <span className="text-sm text-foreground-muted">
                A conta ativa permite entrar; o acesso premium é tratado na seção
                Acesso.
              </span>
            </div>
          </section>

          <section aria-labelledby="role-heading">
            <h3 id="role-heading" className="text-sm font-semibold text-foreground">
              Role
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {user.roles.map((role) => (
                <RoleBadge key={role} role={role} />
              ))}
            </div>
            <p className="mt-1 text-xs text-foreground-muted">
              {isSuperAdmin
                ? "Role atribuída. A atribuição de ARTIST/SUPER_ADMIN é separada e restrita."
                : `${ROLE_LABELS[user.roles[0] ?? "SUBSCRIBER"]} · role somente leitura.`}
            </p>
          </section>

          <section aria-labelledby="access-heading">
            <h3 id="access-heading" className="text-sm font-semibold text-foreground">
              Acesso
            </h3>

            <div className="mt-2 rounded-md border border-border p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-foreground">
                  {access?.tier?.name ?? "Gratuito"}
                </span>
                <AccessStatusBadge status={accessStatus} />
              </div>

              <dl className="mt-2 grid gap-x-4 gap-y-1 text-xs text-foreground-muted sm:grid-cols-2">
                <div className="flex gap-1">
                  <dt className="font-medium">Início:</dt>
                  <dd>{access?.startsAt ? new Date(access.startsAt).toLocaleDateString("pt-BR") : "—"}</dd>
                </div>
                <div className="flex gap-1">
                  <dt className="font-medium">Expiração:</dt>
                  <dd>
                    {access?.permanent
                      ? "Permanente"
                      : access?.expiresAt
                        ? new Date(access.expiresAt).toLocaleDateString("pt-BR")
                        : "—"}
                  </dd>
                </div>
                <div className="flex gap-1">
                  <dt className="font-medium">Estado:</dt>
                  <dd>
                    {access?.permanent
                      ? "Acesso permanente"
                      : access?.expiringSoon
                        ? "Expirando em breve"
                        : accessStatus}
                  </dd>
                </div>
              </dl>
            </div>

            <form onSubmit={handleGrant} className="mt-4 space-y-4">
              <Field id="tierId" label="Tier de acesso">
                <Select
                  id="tierId"
                  data-testid="tier-select"
                  value={tierId}
                  onChange={(event) => setTierId(event.target.value)}
                  disabled={busy}
                >
                  <option value="">Gratuito (sem tier)</option>
                  {tiers.map((tier) => (
                    <option key={tier.id} value={tier.id}>
                      {tier.name} · prioridade {tier.priority}
                    </option>
                  ))}
                </Select>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="startsAt"
                  label="Início"
                  help="Inclui o dia selecionado."
                  error={fieldErrors.startsAt}
                >
                  <Input
                    id="startsAt"
                    type="date"
                    value={startsAt}
                    invalid={Boolean(fieldErrors.startsAt)}
                    onChange={(event) => {
                      setStartsAt(event.target.value)
                      setFieldErrors((current) => ({ ...current, startsAt: undefined }))
                    }}
                    disabled={busy}
                  />
                </Field>

                <Field
                  id="expiresAt"
                  label="Expiração"
                  help="Inclui o dia selecionado."
                  error={fieldErrors.expiresAt}
                >
                  <Input
                    id="expiresAt"
                    type="date"
                    value={expiresAt}
                    invalid={Boolean(fieldErrors.expiresAt)}
                    onChange={(event) => {
                      setExpiresAt(event.target.value)
                      setFieldErrors((current) => ({ ...current, expiresAt: undefined }))
                    }}
                    disabled={busy || permanent}
                  />
                </Field>
              </div>

              <Checkbox
                id="permanent"
                label="Acesso permanente"
                checked={permanent}
                onChange={(event) => {
                  setPermanent(event.target.checked)
                  setFieldErrors((current) => ({ ...current, expiresAt: undefined }))
                }}
                disabled={busy}
              />

              <Field id="internalNote" label="Observação interna">
                <Input
                  id="internalNote"
                  type="text"
                  value={internalNote}
                  onChange={(event) => setInternalNote(event.target.value)}
                  placeholder="Ex.: pagamento confirmado via WhatsApp"
                />
              </Field>

              {tierId && (
                <div className="rounded-md border border-border bg-surface-muted/50 p-3">
                  <p className="text-sm font-medium text-foreground">
                    Resultado esperado
                  </p>
                  <dl className="mt-1 grid gap-x-4 gap-y-0.5 text-xs text-foreground-muted sm:grid-cols-3">
                    <div className="flex gap-1">
                      <dt className="font-medium">Tier:</dt>
                      <dd>{selectedTier?.name ?? "Gratuito"}</dd>
                    </div>
                    <div className="flex gap-1">
                      <dt className="font-medium">Validade:</dt>
                      <dd>
                        {permanent
                          ? "Permanente"
                          : expiresAt
                            ? `${Math.max(1, Math.round((new Date(`${expiresAt}T23:59:59`).getTime() - new Date(`${startsAt}T00:00:00`).getTime()) / 86400000))} dia(s)`
                            : "—"}
                      </dd>
                    </div>
                    <div className="flex gap-1">
                      <dt className="font-medium">Status esperado:</dt>
                      <dd>{EXPECTED_STATUS_LABELS[expectedStatus(startsAt, expiresAt, permanent)] ?? "—"}</dd>
                    </div>
                  </dl>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Button type="submit" loading={busy} disabled={!tierId}>
                  {busy ? "Salvando..." : "Conceder / salvar"}
                </Button>

                {hasAccess && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setRenewing(true)
                      setRenewExpiresAt("")
                      setRenewFieldError(null)
                    }}
                    disabled={busy}
                  >
                    Renovar
                  </Button>
                )}

                {hasAccess && (
                  <Button
                    variant="danger"
                    onClick={() => setConfirmRevoke(true)}
                    disabled={busy}
                  >
                    Revogar
                  </Button>
                )}
              </div>
            </form>

            {renewing && (
              <div className="mt-4 rounded-md border border-border p-3">
                <p className="text-sm font-semibold text-foreground">Renovar acesso</p>
                <p className="mt-1 text-xs text-foreground-muted">
                  {access?.expiresAt && new Date(access.expiresAt) <= new Date()
                    ? "O acesso está expirado; a renovação restaurará o acesso premium."
                    : "O acesso continuará ativo após a renovação."}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {[7, 30, 90].map((days) => (
                    <Button
                      key={days}
                      variant="outline"
                      size="sm"
                      onClick={() => setRenewExpiresAt(addDaysDate(days))}
                    >
                      +{days} dias
                    </Button>
                  ))}
                </div>

                <Field
                  id="renewExpiresAt"
                  label="Nova expiração"
                  error={renewFieldError}
                  className="mt-3"
                >
                  <Input
                    id="renewExpiresAt"
                    type="date"
                    value={renewExpiresAt}
                    invalid={Boolean(renewFieldError)}
                    onChange={(event) => {
                      setRenewExpiresAt(event.target.value)
                      setRenewFieldError(null)
                    }}
                  />
                </Field>

                <Field id="renewNote" label="Observação (opcional)" className="mt-3">
                  <Input
                    id="renewNote"
                    type="text"
                    value={renewNote}
                    onChange={(event) => setRenewNote(event.target.value)}
                  />
                </Field>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => void handleRenew()}
                    loading={busy}
                  >
                    Confirmar renovação
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setRenewing(false)}
                    disabled={busy}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </section>

          {error && <Alert variant="error">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <section aria-labelledby="history-heading">
            <div className="flex items-center justify-between">
              <h3 id="history-heading" className="text-sm font-semibold text-foreground">
                Histórico de acesso
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void handleToggleHistory()}
              >
                {showHistory ? "Ocultar" : "Ver histórico"}
              </Button>
            </div>

            {showHistory && (
              <div className="mt-3">
                <AccessHistoryTimeline
                  events={history}
                  loading={loadingHistory}
                  error={historyError}
                  onRetry={() => void handleToggleHistory()}
                />
              </div>
            )}
          </section>
        </div>
      </Dialog>

      <ConfirmDialog
        open={confirmRevoke}
        title="Revogar acesso"
        description={
          <>
            O acesso premium será removido imediatamente.
            <br />
            A conta continuará ativa e o acesso público/Free permanecerá. O
            histórico será preservado.
          </>
        }
        confirmLabel="Sim, revogar"
        variant="danger"
        busy={busy}
        onConfirm={() => void handleRevoke()}
        onCancel={() => setConfirmRevoke(false)}
      >
        <div className="mt-3">
          <Field id="revokeNote" label="Motivo (opcional)">
            <Input
              id="revokeNote"
              type="text"
              value={revokeNote}
              onChange={(event) => setRevokeNote(event.target.value)}
              placeholder="Ex.: solicitação do membro"
            />
          </Field>
        </div>
      </ConfirmDialog>
    </>
  )
}

async function refetchUserWithAccess(userId: string): Promise<User> {
  const [refetched, access] = await Promise.all([
    fetchUser(userId),
    fetchTierAccess(userId),
  ])

  return {
    ...refetched,
    tier: access.tier,
    tierId: access.tier?.id ?? null,
    tierAccess: access,
  }
}

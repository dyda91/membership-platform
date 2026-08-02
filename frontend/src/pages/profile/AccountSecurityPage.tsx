import { useState } from "react"
import type { FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import type { AxiosError } from "axios"

import { useAuth } from "../../contexts/AuthContext"
import { changePassword, logoutAll } from "../../services/auth"
import PageContainer from "../../components/ui/PageContainer"
import PageHeader from "../../components/ui/PageHeader"
import Card from "../../components/ui/Card"
import Field from "../../components/ui/Field"
import Input from "../../components/ui/Input"
import Button from "../../components/ui/Button"
import Alert from "../../components/ui/Alert"
import ConfirmDialog from "../../components/ui/ConfirmDialog"

const PASSWORD_HINT =
  "Mínimo de 8 caracteres e no máximo 128. Evite senhas óbvias."

export default function AccountSecurityPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmLogoutAll, setConfirmLogoutAll] = useState(false)
  const [loggingOutAll, setLoggingOutAll] = useState(false)

  function clearFields() {
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }

  function endSession(message: string) {
    logout()
    navigate("/login", { replace: true, state: { message } })
  }

  async function handleChangePassword(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setFieldError(null)

    if (newPassword !== confirmPassword) {
      setFieldError("As senhas não coincidem.")

      return
    }

    setSubmitting(true)

    try {
      await changePassword(currentPassword, newPassword)
      clearFields()
      endSession("Senha alterada. Entre novamente com a nova senha.")
    } catch (requestError) {
      const status = (requestError as AxiosError)?.response?.status

      if (status === 401) {
        setError("A senha atual está incorreta.")
      } else {
        setError("Não foi possível alterar a senha. Verifique os dados.")
      }

      clearFields()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleLogoutAll() {
    setLoggingOutAll(true)
    setError(null)

    try {
      await logoutAll()
      endSession("Você saiu de todas as sessões.")
    } catch {
      setError("Não foi possível sair de todas as sessões.")
      setConfirmLogoutAll(false)
    } finally {
      setLoggingOutAll(false)
    }
  }

  return (
    <PageContainer width="standard">
      <PageHeader
        title="Segurança da conta"
        description="Altere sua senha ou encerre todas as sessões ativas."
      />

      {error && (
        <div className="mb-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <section aria-labelledby="change-password-heading">
        <Card className="p-6">
          <h2
            id="change-password-heading"
            className="text-base font-semibold text-foreground"
          >
            Alterar senha
          </h2>

          <p className="mt-1 text-sm text-foreground-muted">
            Após alterar a senha, todas as sessões serão encerradas e você
            precisará entrar novamente.
          </p>

          <form onSubmit={handleChangePassword} className="mt-5 space-y-4">
            <p className="text-sm text-foreground-muted">{PASSWORD_HINT}</p>

            <Field id="currentPassword" label="Senha atual">
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="newPassword" label="Nova senha">
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={128}
                />
              </Field>

              <Field id="confirmPassword" label="Confirme a nova senha" error={fieldError}>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  invalid={Boolean(fieldError)}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value)
                    setFieldError(null)
                  }}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  maxLength={128}
                />
              </Field>
            </div>

            <Button type="submit" loading={submitting}>
              {submitting ? "Alterando..." : "Alterar senha"}
            </Button>
          </form>
        </Card>
      </section>

      <section aria-labelledby="sessions-heading" className="mt-6">
        <Card className="p-6">
          <h2
            id="sessions-heading"
            className="text-base font-semibold text-foreground"
          >
            Sessões
          </h2>

          <p className="mt-1 text-sm text-foreground-muted">
            Encerre esta e todas as outras sessões ativas da sua conta.
          </p>

          <div className="mt-4">
            <Button variant="danger" onClick={() => setConfirmLogoutAll(true)}>
              Sair de todas as sessões
            </Button>
          </div>
        </Card>
      </section>

      <ConfirmDialog
        open={confirmLogoutAll}
        title="Sair de todas as sessões"
        description="Todos os dispositivos serão desconectados e você precisará entrar novamente."
        confirmLabel="Sair de todas as sessões"
        variant="danger"
        busy={loggingOutAll}
        onConfirm={() => void handleLogoutAll()}
        onCancel={() => setConfirmLogoutAll(false)}
      />
    </PageContainer>
  )
}

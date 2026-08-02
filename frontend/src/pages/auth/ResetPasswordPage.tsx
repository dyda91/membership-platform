import { useState } from "react"
import type { FormEvent } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import type { AxiosError } from "axios"

import { resetPassword } from "../../services/auth"
import PageContainer from "../../components/ui/PageContainer"
import Card from "../../components/ui/Card"
import Field from "../../components/ui/Field"
import Input from "../../components/ui/Input"
import Button from "../../components/ui/Button"
import Alert from "../../components/ui/Alert"

const PASSWORD_HINT =
  "Mínimo de 8 caracteres e no máximo 128. Não use uma senha óbvia."

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") ?? ""

  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [invalid, setInvalid] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setFieldError(null)

    if (newPassword !== confirmPassword) {
      setFieldError("As senhas não coincidem.")

      return
    }

    setSubmitting(true)

    try {
      await resetPassword(token, newPassword)
      setNewPassword("")
      setConfirmPassword("")
      setDone(true)
    } catch (requestError) {
      const status = (requestError as AxiosError)?.response?.status

      if (status === 401) {
        setInvalid(true)
        setNewPassword("")
        setConfirmPassword("")
      } else {
        setError("Não foi possível redefinir a senha. Tente novamente.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background py-10">
        <PageContainer width="narrow">
          <Card className="p-6 text-center sm:p-8">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Link inválido
            </h1>
            <p className="mt-2 text-sm text-foreground-muted">
              O link de redefinição está incompleto ou expirado.
            </p>
            <div className="mt-6">
              <Button onClick={() => navigate("/forgot-password")}>
                Solicitar novo link
              </Button>
            </div>
          </Card>
        </PageContainer>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background py-10">
      <PageContainer width="narrow">
        <Card className="p-6 sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Redefinir senha
          </h1>

          {invalid ? (
            <div className="mt-6">
              <Alert variant="error">
                O link de redefinição é inválido, expirado ou já foi utilizado.
              </Alert>
              <div className="mt-4">
                <Button onClick={() => navigate("/forgot-password")}>
                  Solicitar novo link
                </Button>
              </div>
            </div>
          ) : done ? (
            <div className="mt-6">
              <Alert variant="success">
                Senha redefinida com sucesso. Faça login com a nova senha.
              </Alert>
              <div className="mt-4">
                <Link to="/login">
                  <Button>Ir para o Login</Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <p className="text-sm text-foreground-muted">{PASSWORD_HINT}</p>

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

              {error && <Alert variant="error">{error}</Alert>}

              <Button type="submit" fullWidth size="lg" loading={submitting}>
                {submitting ? "Redefinindo..." : "Redefinir senha"}
              </Button>
            </form>
          )}

          <p className="mt-4 text-center text-sm text-foreground-muted">
            <Link to="/login" className="font-medium text-primary hover:underline">
              Voltar ao Login
            </Link>
          </p>
        </Card>
      </PageContainer>
    </div>
  )
}

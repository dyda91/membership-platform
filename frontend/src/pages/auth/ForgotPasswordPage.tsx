import { useState } from "react"
import type { FormEvent } from "react"
import { Link } from "react-router-dom"
import type { AxiosError } from "axios"

import { forgotPassword } from "../../services/auth"
import PageContainer from "../../components/ui/PageContainer"
import Card from "../../components/ui/Card"
import Field from "../../components/ui/Field"
import Input from "../../components/ui/Input"
import Button from "../../components/ui/Button"
import Alert from "../../components/ui/Alert"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      await forgotPassword(email)
      setSent(true)
    } catch (requestError) {
      const status = (requestError as AxiosError)?.response?.status

      if (status === 429) {
        setError("Muitas solicitações. Aguarde um instante e tente novamente.")
      } else {
        // Never reveal whether the account exists.
        setSent(true)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background py-10">
      <PageContainer width="narrow">
        <Card className="p-6 sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Recuperar senha
          </h1>

          <p className="mt-2 text-sm text-foreground-muted">
            Informe o e-mail da sua conta para receber instruções de recuperação.
          </p>

          {sent ? (
            <div className="mt-6">
              <Alert variant="success">
                Se uma conta existir para este e-mail, enviaremos instruções de
                recuperação.
              </Alert>
              <div className="mt-4">
                <Link to="/login">
                  <Button variant="outline">Voltar ao Login</Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <Field id="email" label="E-mail">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </Field>

              {error && <Alert variant="error">{error}</Alert>}

              <Button type="submit" fullWidth size="lg" loading={submitting}>
                {submitting ? "Enviando..." : "Enviar instruções"}
              </Button>
            </form>
          )}

          <p className="mt-4 text-center text-sm text-foreground-muted">
            Lembrou a senha?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </Card>
      </PageContainer>
    </div>
  )
}

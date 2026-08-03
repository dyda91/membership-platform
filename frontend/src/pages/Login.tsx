import { useState } from "react"
import type { FormEvent } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"

import { useAuth } from "../contexts/AuthContext"
import PageContainer from "../components/ui/PageContainer"
import Card from "../components/ui/Card"
import Field from "../components/ui/Field"
import Input from "../components/ui/Input"
import Button from "../components/ui/Button"
import Alert from "../components/ui/Alert"

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const stateMessage = (location.state as { message?: string } | null)?.message
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
    <div className="flex min-h-screen items-center justify-center bg-background py-10">
      <PageContainer width="narrow">
        <Card className="p-6 sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Entrar
          </h1>

          <p className="mt-2 text-sm text-foreground-muted">
            Acesse a plataforma com sua conta.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Field id="email" label="Email">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </Field>

            <Field id="password" label="Senha">
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </Field>

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
              >
                Esqueci minha senha
              </Link>
            </div>

            {stateMessage && <Alert variant="info">{stateMessage}</Alert>}

            {error && <Alert variant="error">{error}</Alert>}

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={submitting}
            >
              {submitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-foreground-muted">
            Ainda não possui conta?{" "}
            <Link
              to="/register"
              className="font-medium text-primary hover:underline"
            >
              Cadastre-se
            </Link>
          </p>
        </Card>
      </PageContainer>
    </div>
  )
}

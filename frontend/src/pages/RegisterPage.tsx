import { useState } from "react"
import type { FormEvent } from "react"
import { Link, useNavigate } from "react-router-dom"

import { login, register } from "../services/auth"
import PageContainer from "../components/ui/PageContainer"
import Card from "../components/ui/Card"
import Field from "../components/ui/Field"
import Input from "../components/ui/Input"
import Button from "../components/ui/Button"
import Alert from "../components/ui/Alert"

export default function RegisterPage() {
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.")
      setSubmitting(false)

      return
    }

    try {
      await register({ name: name || undefined, email, password })
      await login(email, password)
      navigate("/", { replace: true })
    } catch (requestError) {
      const status = (requestError as { response?: { status?: number } })
        ?.response?.status

      if (status === 409) {
        setError("Este e-mail já está cadastrado.")
      } else {
        setError("Não foi possível criar a conta. Verifique os dados.")
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
            Criar conta
          </h1>

          <p className="mt-2 text-sm text-foreground-muted">
            Cadastre-se para acompanhar o conteúdo da artista.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Field id="name" label="Nome">
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
              />
            </Field>

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
                autoComplete="new-password"
                required
                minLength={8}
              />
            </Field>

            <Field id="confirmPassword" label="Confirme a senha">
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                required
                minLength={8}
              />
            </Field>

            {error && <Alert variant="error">{error}</Alert>}

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={submitting}
            >
              {submitting ? "Criando conta..." : "Criar conta"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-foreground-muted">
            Já possui uma conta?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Entrar
            </Link>
          </p>
        </Card>
      </PageContainer>
    </div>
  )
}

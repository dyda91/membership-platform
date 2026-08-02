import PageContainer from "../components/ui/PageContainer"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import { Link } from "react-router-dom"

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <PageContainer width="narrow">
        <Card className="p-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Página não encontrada
          </h1>
          <p className="mt-2 text-sm text-foreground-muted">
            O endereço informado não existe ou foi movido.
          </p>
          <div className="mt-6">
            <Link to="/">
              <Button>Voltar ao Feed</Button>
            </Link>
          </div>
        </Card>
      </PageContainer>
    </div>
  )
}

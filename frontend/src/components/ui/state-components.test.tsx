import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import EmptyState from "./EmptyState"
import ErrorState from "./ErrorState"
import Alert from "./Alert"
import Spinner from "./Spinner"

describe("EmptyState", () => {
  it("shows title, description and an action", () => {
    render(
      <EmptyState
        title="Nenhum post"
        description="Publique um novo conteúdo."
        action={<button type="button">Criar</button>}
      />,
    )

    expect(screen.getByText("Nenhum post")).toBeInTheDocument()
    expect(screen.getByText("Publique um novo conteúdo.")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Criar" })).toBeInTheDocument()
  })
})

describe("ErrorState", () => {
  it("offers a retry action that triggers the callback", async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()

    render(<ErrorState title="Falha ao carregar" onRetry={onRetry} />)

    await user.click(screen.getByRole("button", { name: "Tentar novamente" }))

    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})

describe("Alert", () => {
  it("exposes errors with the alert role", () => {
    render(<Alert variant="error">Não foi possível salvar.</Alert>)

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Não foi possível salvar.",
    )
  })

  it("exposes success messages with the status role", () => {
    render(<Alert variant="success">Perfil atualizado.</Alert>)

    expect(screen.getByRole("status")).toHaveTextContent("Perfil atualizado.")
  })
})

describe("Spinner", () => {
  it("renders a loading status", () => {
    render(<Spinner />)

    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Carregando")
  })
})

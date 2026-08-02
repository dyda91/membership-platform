import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import Button from "./Button"
import IconButton from "./IconButton"
import { IconClose } from "./Icons"

describe("Button", () => {
  it("renders children text", () => {
    render(<Button>Salvar</Button>)
    expect(screen.getByRole("button", { name: "Salvar" })).toBeInTheDocument()
  })

  it("applies the danger variant class", () => {
    render(<Button variant="danger">Excluir</Button>)
    expect(screen.getByRole("button")).toHaveClass("bg-danger")
  })

  it("disables the button when disabled or loading", () => {
    const { rerender } = render(<Button disabled>Salvar</Button>)
    expect(screen.getByRole("button")).toBeDisabled()

    rerender(<Button loading>Salvar</Button>)
    expect(screen.getByRole("button")).toBeDisabled()
    expect(screen.getByRole("status")).toBeInTheDocument()
  })

  it("prevents submission while loading", async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button loading onClick={onClick}>Salvar</Button>)

    await user.click(screen.getByRole("button"))

    expect(onClick).not.toHaveBeenCalled()
  })

  it("renders a link-styled button without a box", () => {
    render(<Button variant="link">Voltar</Button>)
    expect(screen.getByRole("button")).toHaveClass("text-primary")
  })
})

describe("IconButton", () => {
  it("exposes an accessible name", () => {
    render(<IconButton label="Fechar" icon={<IconClose />} />)
    expect(screen.getByRole("button", { name: "Fechar" })).toBeInTheDocument()
  })

  it("keeps an adequate touch target", () => {
    render(<IconButton label="Fechar" icon={<IconClose />} />)
    expect(screen.getByRole("button")).toHaveClass("h-10 w-10")
  })
})

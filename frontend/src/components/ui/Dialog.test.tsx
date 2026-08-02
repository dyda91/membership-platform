import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import Dialog from "./Dialog"
import Button from "./Button"

function renderDialog(onClose = vi.fn(), props: Partial<Parameters<typeof Dialog>[0]> = {}) {
  return render(
    <Dialog
      open
      onClose={onClose}
      title="Excluir post"
      description="Esta ação não pode ser desfeita."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="danger">Excluir</Button>
        </>
      }
      {...props}
    >
      <p>Conteúdo do diálogo</p>
    </Dialog>,
  )
}

describe("Dialog", () => {
  it("renders a dialog with title and description", () => {
    renderDialog()

    const dialog = screen.getByRole("dialog", { name: "Excluir post" })
    expect(dialog).toBeInTheDocument()
    expect(screen.getByText("Esta ação não pode ser desfeita.")).toBeInTheDocument()
  })

  it("moves focus into the dialog on open", () => {
    renderDialog()

    const dialog = screen.getByRole("dialog", { name: "Excluir post" })
    expect(dialog.contains(document.activeElement)).toBe(true)
  })

  it("closes when Escape is pressed", async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    renderDialog(onClose)

    await user.keyboard("{Escape}")

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("closes via the explicit close control without executing", async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    renderDialog(onClose)

    await user.click(screen.getByRole("button", { name: "Fechar" }))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it("renders nothing when closed", () => {
    render(
      <Dialog open={false} onClose={vi.fn()} title="Excluir post">
        <p>Conteúdo</p>
      </Dialog>,
    )

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("is announced as modal", () => {
    renderDialog()

    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true")
  })
})

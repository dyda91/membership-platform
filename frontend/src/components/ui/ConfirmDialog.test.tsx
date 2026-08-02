import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import ConfirmDialog from "./ConfirmDialog"

describe("ConfirmDialog", () => {
  it("confirms the destructive action", async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onCancel = vi.fn()

    render(
      <ConfirmDialog
        open
        title="Excluir tier"
        confirmLabel="Excluir"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    )

    await user.click(screen.getByRole("button", { name: "Excluir" }))

    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onCancel).not.toHaveBeenCalled()
  })

  it("cancels without executing", async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onCancel = vi.fn()

    render(
      <ConfirmDialog
        open
        title="Excluir tier"
        confirmLabel="Excluir"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    )

    await user.click(screen.getByRole("button", { name: "Cancelar" }))

    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("prevents duplicate destructive submission while busy", async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()

    render(
      <ConfirmDialog
        open
        title="Excluir tier"
        confirmLabel="Excluir"
        busy
        onConfirm={onConfirm}
        onCancel={vi.fn()}
      />,
    )

    await user.click(screen.getByRole("button", { name: /excluir/i }))

    expect(onConfirm).not.toHaveBeenCalled()
  })

  it("keeps Escape from closing while an operation is running", async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()

    render(
      <ConfirmDialog
        open
        title="Excluir tier"
        confirmLabel="Excluir"
        busy
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    )

    await user.keyboard("{Escape}")

    expect(onCancel).not.toHaveBeenCalled()
  })
})
